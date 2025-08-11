import { IsNotEmpty } from 'class-validator';

export class PermissionDto {
  @IsNotEmpty()
  module: string;

  @IsNotEmpty()
  section: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  checker: number;
}
