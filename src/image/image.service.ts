import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { S3ConfigService } from '../_config/s3.config.service';

@Injectable()
export class ImageService {
    constructor(private readonly s3ConfigService: S3ConfigService) {}

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
}
