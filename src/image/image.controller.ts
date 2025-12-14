import {
    Controller,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('image')
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    // 에디터 이미지 업로드
    @UseGuards(JwtAuthGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('image'))
    async imageUpload(@UploadedFile() image: Express.Multer.File) {
        return await this.imageService.imageUpload(image);
    }
}
