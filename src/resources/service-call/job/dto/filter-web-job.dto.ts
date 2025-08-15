import { IsOptional } from 'class-validator';

export class FilterWebJobDto {
  @IsOptional()
  JobID: any;

  @IsOptional()
  Technician: any;

  @IsOptional()
  Priority: string;

  @IsOptional()
  PlannedStartDateTime: string;

  @IsOptional()
  PlannedEndDateTime: string;

  @IsOptional()
  FinalStatus: string;
}
