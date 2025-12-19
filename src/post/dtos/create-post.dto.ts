import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsArray()
    @IsString({ each: true })
    tags!: string[];

    @IsString()
    @IsNotEmpty()
    content!: string;

    @IsString()
    @IsOptional()
    thumbnailUrl?: string | null;
}
