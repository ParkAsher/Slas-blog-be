import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
    UseGuards,
    ParseIntPipe,
    Param,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dtos/create-post.dto';
import { Request } from 'express';

@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    /** 글 등록 */
    @UseGuards(JwtAuthGuard)
    @Post('')
    async createPost(@Body() data: CreatePostDto, @Req() req: Request) {
        const authorId = req.user.sub;

        await this.postService.createPost(data, authorId);

        return { success: true };
    }

    /** 글 리스트 가져오기 */
    @Get('')
    async getPosts(
        @Query('page', ParseIntPipe) page: number,
        @Query('tag') tag?: string,
    ) {
        return await this.postService.getPosts(page, tag);
    }

    /** 글 상세 가져오기 */
    @Get(':slug')
    async getPost(@Param('slug') slug: string) {
        return await this.postService.getPost(slug);
    }
}
