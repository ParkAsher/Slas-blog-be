import { Injectable } from '@nestjs/common';
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
}
