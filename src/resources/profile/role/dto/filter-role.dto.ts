import { IsOptional, IsNotEmpty } from 'class-validator';

export class FilterRoleDto {
  @IsOptional()
  name: any;

  @IsOptional()
  status: boolean;

  @IsOptional()
  action: string;
}
