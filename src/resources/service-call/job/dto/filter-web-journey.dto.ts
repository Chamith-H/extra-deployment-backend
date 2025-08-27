import { IsOptional } from 'class-validator';

export class FilterWebJourneyDto {
  @IsOptional()
  journeyID: any;

  @IsOptional()
  technician: any;

  @IsOptional()
  vehicleType: string;

  @IsOptional()
  vahicleNumber: string;

  @IsOptional()
  startDate: string;

  @IsOptional()
  endDate: string;

  @IsOptional()
  status: string;

  @IsOptional()
  action: string;
}
