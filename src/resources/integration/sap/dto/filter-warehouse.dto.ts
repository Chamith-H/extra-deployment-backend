import { IsOptional } from 'class-validator';

export class FilterWarehouseDto {
  @IsOptional()
  WarehouseCode: any;
}
