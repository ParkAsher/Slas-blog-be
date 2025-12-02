import * as bcrypt from 'bcrypt';

// 비밀번호 해싱
export async function saltAndHashPassword(password: string) {
    const saltRounds = 10;

    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
}

// 비밀번호 비교
export async function comparePassword(
    password: string,
    hashedPassword: string,
): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}
