import { IsOptional, IsNotEmpty } from 'class-validator';
import { Role } from 'src/schemas/profile/role.entity';

export class UserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  employId: string;

  @IsNotEmpty()
  role: Role;

  @IsOptional()
  email: string;

  @IsOptional()
  gender: string;

  @IsOptional()
  description: string;
}
