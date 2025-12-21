import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TagService {
    constructor(private readonly prismaService: PrismaService) {}

    /** 태그 전체 불러오기 */
    async getTags() {
        return await this.prismaService.tag.findMany({
            orderBy: {
                createdAt: 'asc',
            },
            select: {
                name: true,
                _count: {
                    select: {
                        posts: true,
                    },
                },
            },
        });
    }
}
