import { IsOptional, IsNotEmpty } from 'class-validator';

export class FilterUserDto {
  @IsOptional()
  name: any;

  @IsOptional()
  employId: any;

  @IsOptional()
  role: any;

  @IsOptional()
  gender: string;

  @IsOptional()
  status: boolean;

  @IsOptional()
  action: string;
}
