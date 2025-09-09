import { IsOptional } from 'class-validator';

export class FilterItemDto {
  @IsOptional()
  ItemCode: any;
}
