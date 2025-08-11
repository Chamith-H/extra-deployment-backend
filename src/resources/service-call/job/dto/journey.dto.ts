import { IsNotEmpty } from 'class-validator';

export class JourneyDto {
  @IsNotEmpty()
  JourneyID: string;

  @IsNotEmpty()
  Technician: number;

  @IsNotEmpty()
  JourneyDate: string;

  @IsNotEmpty()
  VehicleType: string;

  @IsNotEmpty()
  StartDateTime: string;

  @IsNotEmpty()
  StartVehicleNumber: string;

  @IsNotEmpty()
  StartMeter: string;

  @IsNotEmpty()
  StartLat: string;

  @IsNotEmpty()
  StartLong: string;

  @IsNotEmpty()
  EndDateTime: string;

  @IsNotEmpty()
  EndVehicleNumber: string;

  @IsNotEmpty()
  EndMeter: string;

  @IsNotEmpty()
  EndLat: string;

  @IsNotEmpty()
  EndLong: string;
}
