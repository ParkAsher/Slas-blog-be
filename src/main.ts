import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    // CORS
    app.enableCors({
        origin: ['http://localhost:3000', 'https://slas-log-fe.vercel.app'],
        credentials: true,
    });

    await app.listen(8000);
}
bootstrap();
