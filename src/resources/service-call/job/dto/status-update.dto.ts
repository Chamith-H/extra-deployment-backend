import { IsNotEmpty } from 'class-validator';

export class StatusUpdateDto {
  @IsNotEmpty()
  JourneyID: string;

  @IsNotEmpty()
  JobID: string;

  @IsNotEmpty()
  Status: string;

  @IsNotEmpty()
  AssignedDate: string;

  @IsNotEmpty()
  FinalStatus: string;
}
