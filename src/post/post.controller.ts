import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dtos/create-post.dto';
import { Request } from 'express';

@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    // 글 등록
    @UseGuards(JwtAuthGuard)
    @Post('')
    async createPost(@Body() data: CreatePostDto, @Req() req: Request) {
        const authorId = req.user.sub;

        await this.postService.createPost(data, authorId);

        return { success: true };
    }
}
