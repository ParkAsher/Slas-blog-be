import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { saltAndHashPassword } from 'src/utils/password-utils';

@Injectable()
export class AuthService {
    constructor(private readonly prismaService: PrismaService) {}

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
}
