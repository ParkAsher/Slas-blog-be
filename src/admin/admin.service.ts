import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/decorators/roles.decorator';
import { AdminUsersQueryDto } from './dtos/admin-users-query.dto';
import { ChangeRoleDto } from './dtos/change-role.dto';
import { AdminPostsQueryDto } from './dtos/admin-posts-query.dto';
import { DeletePostsDto } from './dtos/delete-posts.dto';

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
                { role: 'asc' }, // ADMIN 순으로 먼저 표시
                { createdAt: 'desc' }, // 그 다음 가입일 내림차순
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

    /**
     * 게시글 목록 조회 (페이지네이션, 제목 검색, 타입 필터)
     */
    async getAdminPosts(query: AdminPostsQueryDto) {
        const page = query.page || 1;
        const skip = (page - 1) * ITEMS_PER_PAGE;

        const where: {
            title?: { contains: string; mode: 'insensitive' };
            type?: 'dev' | 'story';
        } = {};

        if (query.search) {
            where.title = {
                contains: query.search,
                mode: 'insensitive' as const,
            };
        }

        if (query.type === 'dev' || query.type === 'story') {
            where.type = query.type;
        }

        // 전체 게시글 수
        const total = await this.prisma.post.count({ where });

        // 게시글 목록
        const posts = await this.prisma.post.findMany({
            where,
            select: {
                id: true,
                title: true,
                type: true,
                slug: true,
                createdAt: true,
                author: {
                    select: {
                        id: true,
                        nickname: true,
                        isDeleted: true,
                    },
                },
                tags: {
                    select: {
                        tag: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        Comments: true,
                    },
                },
            },
            skip,
            take: ITEMS_PER_PAGE,
            orderBy: {
                createdAt: 'desc',
            },
        });

        // 응답 포맷팅
        const formattedPosts = posts.map((post) => ({
            ...post,
            tags: post.tags.map((postTag) => postTag.tag.name),
            commentCount: post._count.Comments,
        }));

        return {
            posts: formattedPosts,
            pagination: {
                page,
                perPage: ITEMS_PER_PAGE,
                total,
                totalPages: Math.ceil(total / ITEMS_PER_PAGE),
            },
        };
    }

    /**
     * 게시글 일괄 삭제 (관리자 권한)
     */
    async deletePostsByAdmin(dto: DeletePostsDto) {
        const { postIds } = dto;

        // 빈 배열 검사
        if (postIds.length === 0) {
            throw new BadRequestException('삭제할 게시글을 선택해주세요.');
        }

        // 존재하는 게시글 조회 (태그 ID 포함)
        const existingPosts = await this.prisma.post.findMany({
            where: {
                id: { in: postIds },
            },
            select: {
                id: true,
                tags: {
                    select: {
                        tagId: true,
                    },
                },
            },
        });

        if (existingPosts.length === 0) {
            throw new NotFoundException('삭제할 게시글이 없습니다.');
        }

        // 실제로 존재하는 게시글 ID 추출
        const foundPostIds = existingPosts.map((post) => post.id);

        // 모든 태그 ID 수집 (정리 대상)
        const tagIdsToClean = new Set<string>();
        existingPosts.forEach((post) => {
            post.tags.forEach((postTag) => {
                tagIdsToClean.add(postTag.tagId);
            });
        });

        // 트랜잭션으로 처리
        await this.prisma.$transaction(async (tx) => {
            // 게시글 일괄 삭제 (PostTag는 Cascade로 자동 삭제)
            await tx.post.deleteMany({
                where: {
                    id: { in: foundPostIds },
                },
            });

            // 사용되지 않는 태그 정리
            if (tagIdsToClean.size > 0) {
                await tx.tag.deleteMany({
                    where: {
                        id: { in: Array.from(tagIdsToClean) },
                        posts: { none: {} },
                    },
                });
            }
        });

        return {
            deletedCount: foundPostIds.length,
        };
    }
}
