import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import slugify from 'slugify';

export async function generateSlug(title: string) {
    const timeStamp = format(new Date(), 'yyMMddHHmmss', { locale: ko });

    // - lower: 소문자로 변환
    // - strict: 특수문자 제거
    // - locale: 한글 등 다양한 언어 지원
    // - trim: 앞뒤 공백 제거
    const slugifiedTitle = slugify(title, {
        lower: true,
        strict: false,
        locale: 'ko',
        trim: true,
        remove: /[*+~.()'"!:@]/g,
    });

    console.log(slugifiedTitle);
    console.log(timeStamp);

    return `${timeStamp}-${slugifiedTitle}`;
}
