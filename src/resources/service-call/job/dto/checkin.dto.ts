import { IsNotEmpty } from 'class-validator';

export class CheckInDto {
  @IsNotEmpty()
  JobID: string;

  @IsNotEmpty()
  CheckedIn: string;

  @IsNotEmpty()
  CheckedInDateTime: string;

  @IsNotEmpty()
  CheckedInLat: string;

  @IsNotEmpty()
  CheckedInLong: string;

  @IsNotEmpty()
  CheckedInVehicleNumber: string;

  @IsNotEmpty()
  CheckedInMeter: string;

  @IsNotEmpty()
  FinalStatus: string;
}
