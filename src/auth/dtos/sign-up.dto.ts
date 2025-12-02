import {
    IsEmail,
    IsNotEmpty,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class SignUpDto {
    @IsEmail()
    email!: string;

    // 8~16자, 영문/숫자 최소 하나씩 반드시 포함
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(16)
    @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
        message: '비밀번호는 영문과 숫자를 포함해야 합니다.',
    })
    password!: string;

    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(8)
    nickname!: string;
}
