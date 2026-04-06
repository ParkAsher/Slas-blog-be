import { IsEnum } from 'class-validator';
import { Role } from '../../common/decorators/roles.decorator';

export class ChangeRoleDto {
    @IsEnum(Role)
    role: Role;
}
