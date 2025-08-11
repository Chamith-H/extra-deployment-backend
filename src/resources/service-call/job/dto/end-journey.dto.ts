import { IsNotEmpty } from 'class-validator';

export class EndJourneyDto {
  @IsNotEmpty()
  JourneyID: string;

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
