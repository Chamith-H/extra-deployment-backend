import { IsOptional } from 'class-validator';

export class FilterWebJourneyDto {
  @IsOptional()
  JourneyID: any;

  @IsOptional()
  Technician: any;

  @IsOptional()
  VehicleType: string;

  @IsOptional()
  StartVehicleNumber: string;

  @IsOptional()
  StartDateTime: string;

  @IsOptional()
  EndDateTime: string;

  @IsOptional()
  Status: string;
}
