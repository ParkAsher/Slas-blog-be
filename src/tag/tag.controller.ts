import { Controller, Get } from '@nestjs/common';
import { TagService } from './tag.service';

@Controller('tag')
export class TagController {
    constructor(private readonly tagService: TagService) {}

    /** 태그 전체 불러오기 */
    @Get('')
    async getTags() {
        return await this.tagService.getTags();
    }
}
