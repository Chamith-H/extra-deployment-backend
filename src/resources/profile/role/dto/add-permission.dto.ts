import { IsNotEmpty } from 'class-validator';

export class AddPermissionDto {
  @IsNotEmpty()
  role: number;

  @IsNotEmpty()
  accesses: any[];
}
