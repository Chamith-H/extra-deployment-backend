import { IsNotEmpty } from 'class-validator';

export class SparePartDto {
  @IsNotEmpty()
  JobID: string;

  @IsNotEmpty()
  RequestId: string;

  @IsNotEmpty()
  Warehouse: string;

  @IsNotEmpty()
  CreatedDate: string;

  @IsNotEmpty()
  lines: any[];
}
