import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EditPostDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    title?: string;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    tags?: string[];

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    content?: string;

    @IsString()
    @IsOptional()
    thumbnailUrl?: string | null;
}
