import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { S3ConfigService } from '../_config/s3.config.service';

@Module({
    controllers: [ImageController],
    providers: [ImageService, S3ConfigService],
})
export class ImageModule {}
