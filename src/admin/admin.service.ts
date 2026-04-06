import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/decorators/roles.decorator';
import { AdminUsersQueryDto } from './dtos/admin-users-query.dto';
import { ChangeRoleDto } from './dtos/change-role.dto';

const ITEMS_PER_PAGE = 20;

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) {}

    /**
     * 회원 목록 조회 (페이지네이션, 닉네임 검색 지원)
     */
    async getUsers(query: AdminUsersQueryDto) {
        const page = query.page || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;

        const where = query.search
            ? {
                  nickname: {
                      contains: query.search,
                      mode: 'insensitive' as const,
                  },
              }
            : {};

        // 전체 회원 수
        const total = await this.prisma.user.count({ where });

        // 회원 목록 (비밀번호 제외, isDeleted 포함)
        const users = await this.prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                nickname: true,
                role: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
            },
            skip,
            take: ITEMS_PER_PAGE,
            orderBy: [
                { role: 'asc' },  // ADMIN 순으로 먼저 표시
                { createdAt: 'desc' },  // 그 다음 가입일 내림차순
            ],
        });

        return {
            users,
            pagination: {
                page,
                perPage: ITEMS_PER_PAGE,
                total,
                totalPages: Math.ceil(total / ITEMS_PER_PAGE),
            },
        };
    }

    /**
     * 회원 역할 변경 (본인 변경 불가)
     */
    async changeUserRole(
        userId: string,
        currentUserId: string,
        dto: ChangeRoleDto,
    ) {
        // 자기 자신 변경 불가
        if (userId === currentUserId) {
            throw new BadRequestException('자신의 역할은 변경할 수 없습니다.');
        }

        // 회원 존재 여부 확인
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('해당 회원을 찾을 수 없습니다.');
        }

        // 역할 변경
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { role: dto.role },
            select: {
                id: true,
                email: true,
                nickname: true,
                role: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return updatedUser;
    }

    /**
     * 회원 비활성화 (soft delete) - 본인 비활성화 불가
     */
    async deactivateUser(userId: string, currentUserId: string) {
        // 자기 자신 비활성화 불가
        if (userId === currentUserId) {
            throw new BadRequestException('자신을 비활성화할 수 없습니다.');
        }

        // 회원 존재 여부 확인
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('해당 회원을 찾을 수 없습니다.');
        }

        // 이미 비활성화된 회원 확인
        if (user.isDeleted) {
            throw new BadRequestException('이미 비활성화된 회원입니다.');
        }

        // 회원 비활성화
        const deactivatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
            select: {
                id: true,
                email: true,
                nickname: true,
                role: true,
                isDeleted: true,
                deletedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return deactivatedUser;
    }
}
