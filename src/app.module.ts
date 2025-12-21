import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ImageModule } from './image/image.module';
import { PostModule } from './post/post.module';
import { TagModule } from './tag/tag.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        AuthModule,
        PrismaModule,
        ImageModule,
        PostModule,
        TagModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
