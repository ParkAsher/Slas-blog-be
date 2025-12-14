import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';

@Injectable()
export class S3ConfigService {
    private readonly s3Client: S3Client;
    private readonly bucketName: string;

    constructor(private readonly configService: ConfigService) {
        const s3Config: S3ClientConfig = {
            endpoint: this.configService.get<string>('NCP_ENDPOINT'),
            region: this.configService.get<string>('NCP_REGION'),
            credentials: {
                accessKeyId: this.configService.get<string>('NCP_ACCESS_KEY'),
                secretAccessKey:
                    this.configService.get<string>('NCP_SECRET_KEY'),
            },
        };

        this.s3Client = new S3Client(s3Config);
        this.bucketName = this.configService.get<string>('NCP_BUCKET');
    }

    getS3Client(): S3Client {
        return this.s3Client;
    }

    getBucketName(): string {
        return this.bucketName;
    }
}
