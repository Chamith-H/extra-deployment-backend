import { IsOptional } from 'class-validator';
import { FindOptionsOrderValue } from 'typeorm';

export class FilterWebJobDto {
  @IsOptional()
  jobId: any;

  @IsOptional()
  technician: any;

  @IsOptional()
  priority: string;

  @IsOptional()
  startDate: string;

  @IsOptional()
  endDate: string;

  @IsOptional()
  finalStatus: string;

  @IsOptional()
  action: string;
}
