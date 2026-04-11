import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { AdminUsersQueryDto } from './dtos/admin-users-query.dto';
import { ChangeRoleDto } from './dtos/change-role.dto';
import { AdminPostsQueryDto } from './dtos/admin-posts-query.dto';
import { DeletePostsDto } from './dtos/delete-posts.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
    constructor(private adminService: AdminService) {}

    /**
     * 회원 목록 조회
     * GET /admin/users?page=1&search=keyword
     */
    @Get('users')
    async getUsers(@Query() query: AdminUsersQueryDto) {
        return this.adminService.getUsers(query);
    }

    /**
     * 회원 역할 변경
     * PATCH /admin/users/:id/role
     */
    @Patch('users/:id/role')
    async changeUserRole(
        @Param('id') userId: string,
        @Body() dto: ChangeRoleDto,
        @Request() req: any,
    ) {
        return this.adminService.changeUserRole(userId, req.user.sub, dto);
    }

    /**
     * 회원 비활성화 (soft delete)
     * DELETE /admin/users/:id
     */
    @Delete('users/:id')
    async deactivateUser(@Param('id') userId: string, @Request() req: any) {
        return this.adminService.deactivateUser(userId, req.user.sub);
    }

    /**
     * 게시글 목록 조회
     * GET /admin/posts?page=1&search=keyword&type=dev
     */
    @Get('posts')
    async getPosts(@Query() query: AdminPostsQueryDto) {
        return this.adminService.getAdminPosts(query);
    }

    /**
     * 게시글 일괄 삭제
     * DELETE /admin/posts
     */
    @Delete('posts')
    async deletePosts(@Body() dto: DeletePostsDto) {
        return this.adminService.deletePostsByAdmin(dto);
    }
}
