import { IsOptional, IsNotEmpty } from 'class-validator';

export class RoleDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description: string;

  @IsOptional()
  status: boolean;
}
