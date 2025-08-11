import { IsOptional, IsNotEmpty } from 'class-validator';

export class FilterUserDto {
  @IsOptional()
  name: any;

  @IsOptional()
  status: boolean;
}
