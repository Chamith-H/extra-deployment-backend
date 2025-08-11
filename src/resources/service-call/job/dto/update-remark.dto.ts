import { IsNotEmpty } from 'class-validator';

export class UpdateRemarkDto {
  @IsNotEmpty()
  JobID: string;

  @IsNotEmpty()
  Remarks: string;

  @IsNotEmpty()
  ServiceCall: number;

  @IsNotEmpty()
  NewlyAdded: string;
}
