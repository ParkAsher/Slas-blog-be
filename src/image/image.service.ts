import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { S3ConfigService } from '../_config/s3.config.service';
import * as sharp from 'sharp';

@Injectable()
export class ImageService {
    constructor(private readonly s3ConfigService: S3ConfigService) {}

    // 에디터 이미지 업로드
    async imageUpload(image: Express.Multer.File) {
        const bucket = this.s3ConfigService.getBucketName();
        const s3Client = this.s3ConfigService.getS3Client();

        const key = `post/${Date.now().toString()}-${image.originalname}`;

        const commend = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: image.buffer,
            ACL: 'public-read-write',
        });

        await s3Client.send(commend);

        return {
            path: `https://kr.object.ncloudstorage.com/${bucket}/${key}`,
        };
    }

    // 에디터 썸네일 업로드 (16:9 비율 강제)
    async thumbnailUpload(thumbnail: Express.Multer.File) {
        const bucket = this.s3ConfigService.getBucketName();
        const s3Client = this.s3ConfigService.getS3Client();

        // 원하는 썸네일 해상도 (16:9 비율, 최대 크기)
        const maxWidth = 1280;
        const maxHeight = 720;

        const sharpInstance = sharp(thumbnail.buffer);
        const metadata = await sharpInstance.metadata();

        let processedBuffer: Buffer;

        // 원본 가로/세로가 최대값을 넘지 않으면 리사이즈 없이 그대로 사용
        if (
            metadata.width &&
            metadata.height &&
            metadata.width <= maxWidth &&
            metadata.height <= maxHeight
        ) {
            processedBuffer = thumbnail.buffer;
        } else {
            // sharp를 이용해 16:9 비율로 리사이즈/크롭
            processedBuffer = await sharpInstance
                .resize({
                    width: maxWidth,
                    height: maxHeight,
                    fit: 'cover', // 중앙 기준으로 잘라내며 16:9 유지
                    position: 'centre',
                })
                .toBuffer();
        }

        const key = `thumbnail/${Date.now().toString()}-${thumbnail.originalname}`;

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: processedBuffer,
            ACL: 'public-read-write',
            ContentType: thumbnail.mimetype,
        });

        await s3Client.send(command);

        return {
            path: `https://kr.object.ncloudstorage.com/${bucket}/${key}`,
        };
    }
}
