import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { generateSlug } from 'src/utils/slug-utils';

@Injectable()
export class PostService {
    constructor(private readonly prismaService: PrismaService) {}

    /** 글 등록 */
    async createPost(
        { title, content, tags, thumbnailUrl }: CreatePostDto,
        authorId: string,
    ): Promise<void> {
        // 1. slug 생성
        const slug = await generateSlug(title);

        // 2. Prisma 트랜잭션으로 게시글 및 태그 생성
        await this.prismaService.$transaction(async (tx) => {
            // 2-1. Post 생성
            const post = await tx.post.create({
                data: {
                    authorId,
                    title,
                    content,
                    thumbnail: thumbnailUrl || null,
                    slug,
                },
            });

            // 2-2. Tag 처리 (기존 태그 찾기 또는 새로 생성)
            const tagIds = await Promise.all(
                tags.map(async (tagName) => {
                    const tag = await tx.tag.upsert({
                        where: { name: tagName },
                        update: {},
                        create: { name: tagName },
                    });

                    return tag.id;
                }),
            );

            // 2-3. PostTag 연결 생성
            await tx.postTag.createMany({
                data: tagIds.map((tagId) => ({
                    postId: post.id,
                    tagId,
                })),
            });
        });
    }

    /** 글 리스트 가져오기 */
    async getPosts(page: number, tag?: string) {
        const limit = 5;
        const skip = (page - 1) * limit;

        // 조건
        const where = tag
            ? {
                  tags: {
                      some: {
                          tag: {
                              name: tag,
                          },
                      },
                  },
              }
            : {};

        const posts = await this.prismaService.post.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                title: true,
                thumbnail: true,
                slug: true,
                views: true,
                createdAt: true,
                author: {
                    select: {
                        id: true,
                        nickname: true,
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
            },
        });

        return posts.map((post) => ({
            ...post,
            tags: post.tags.map((postTag) => postTag.tag.name),
        }));
    }

    /** 글 상세 가져오기 */
    async getPost(slug: string) {
        const post = await this.prismaService.post.findUnique({
            where: { slug },
            select: {
                id: true,
                title: true,
                content: true,
                thumbnail: true,
                slug: true,
                views: true,
                createdAt: true,
                updatedAt: true,
                author: {
                    select: {
                        id: true,
                        nickname: true,
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
            },
        });

        if (!post) {
            throw new NotFoundException('게시글을 찾을 수 없습니다.');
        }

        // 조회수 증가 (게시글이 존재할 때만)
        await this.updateViews(slug);

        return {
            ...post,
            tags: post.tags.map((postTag) => postTag.tag.name),
        };
    }

    /** 글 조회수 증가 */
    async updateViews(slug: string) {
        return await this.prismaService.post.update({
            where: { slug },
            data: {
                views: {
                    increment: 1,
                },
            },
        });
    }

    /** 글 삭제 */
    async deletePost(slug: string, authorId: string) {
        // 1. 게시글 찾기 (태그 정보 포함)
        const post = await this.prismaService.post.findUnique({
            where: { slug },
            select: {
                id: true,
                authorId: true,
                tags: {
                    select: {
                        tagId: true,
                    },
                },
            },
        });

        // 2. 게시글이 없으면 오류
        if (!post) {
            throw new NotFoundException('게시글을 찾을 수 없습니다.');
        }

        // 3. 작성자 확인
        if (post.authorId !== authorId) {
            throw new ForbiddenException('게시글을 삭제할 권한이 없습니다.');
        }

        // 4. 트랜잭션으로 게시글 삭제 및 사용되지 않는 태그 정리
        await this.prismaService.$transaction(async (tx) => {
            // 4-1. 게시글 삭제 (Cascade로 PostTag도 자동 삭제됨)
            await tx.post.delete({
                where: { slug },
            });

            // 4-2. 사용되지 않는 태그 일괄 삭제 (PostTag 연결이 없는 태그만)
            const tagIds = post.tags.map((postTag) => postTag.tagId);

            if (tagIds.length > 0) {
                await tx.tag.deleteMany({
                    where: {
                        id: { in: tagIds },
                        posts: { none: {} },
                    },
                });
            }
        });
    }
}
