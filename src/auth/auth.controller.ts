import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/sign-up.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // 이메일 중복 체크
    @Get('check-email')
    async checkEmail(@Query('email') email: string) {
        const exists = await this.authService.checkEmailDuplicate(email);
        return { exists };
    }

    // 닉네임 중복 체크
    @Get('check-nickname')
    async checkNickname(@Query('nickname') nickname: string) {
        const exists = await this.authService.checkNicknameDuplicate(nickname);
        return { exists };
    }

    // 회원가입
    @Post('sign-up')
    async signup(@Body() data: SignUpDto) {
        return await this.authService.signup(
            data.email,
            data.password,
            data.nickname,
        );
    }
}
