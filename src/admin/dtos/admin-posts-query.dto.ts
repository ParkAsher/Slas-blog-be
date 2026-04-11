import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminPostsQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsString()
    search?: string; // 제목 검색

    @IsOptional()
    @IsEnum(['dev', 'story'])
    type?: 'dev' | 'story'; // 게시글 타입 필터
}
