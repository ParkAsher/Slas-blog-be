import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { saltAndHashPassword, comparePassword } from 'src/utils/password-utils';

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    // 이메일 중복 체크
    async checkEmailDuplicate(email: string): Promise<boolean> {
        const user = await this.prismaService.user.findUnique({
            where: { email },
            select: { id: true },
        });

        return !!user;
    }

    // 닉네임 중복 체크
    async checkNicknameDuplicate(nickname: string): Promise<boolean> {
        const user = await this.prismaService.user.findUnique({
            where: { nickname },
            select: { id: true },
        });
        return !!user;
    }

    // 회원가입
    async signup(email: string, password: string, nickname: string) {
        const normalizedEmail = email.trim().toLowerCase();

        const hashedPassword = await saltAndHashPassword(password);

        try {
            const user = await this.prismaService.user.create({
                data: {
                    email: normalizedEmail,
                    password: hashedPassword,
                    nickname,
                    role: 'USER',
                },
                select: {
                    id: true,
                    email: true,
                    nickname: true,
                    role: true,
                    createdAt: true,
                },
            });

            return user;
        } catch (error) {
            throw error;
        }
    }

    // 로그인
    async signin(email: string, password: string) {
        const normalizedEmail = email.trim().toLowerCase();

        // 이메일로 유저 찾기
        const user = await this.prismaService.user.findUnique({
            where: { email: normalizedEmail },
            select: {
                id: true,
                email: true,
                password: true,
                nickname: true,
                role: true,
            },
        });

        // 유저가 존재하지 않으면 오류
        if (!user) {
            throw new UnauthorizedException('존재하지 않는 이메일입니다');
        }

        // 비밀번호 검증
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('비밀번호가 올바르지 않습니다');
        }

        // JWT 토큰 생성 (id, nickname, role 포함)
        const payload = {
            sub: user.id,
            nickname: user.nickname,
            role: user.role,
        };

        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                nickname: user.nickname,
                role: user.role,
            },
        };
    }
}
