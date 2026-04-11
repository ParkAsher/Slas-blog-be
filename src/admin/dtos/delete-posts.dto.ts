import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class DeletePostsDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    postIds: string[]; // 삭제할 게시글 ID 배열
}
