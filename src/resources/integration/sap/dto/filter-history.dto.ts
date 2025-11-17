import { IsOptional } from 'class-validator';

export class FilterHistoryDto {
  @IsOptional()
  fromDate: string;

  @IsOptional()
  toDate: string;

  @IsOptional()
  customer: string;
}
