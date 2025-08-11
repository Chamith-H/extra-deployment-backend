import { IsNotEmpty } from 'class-validator';

export class JobJourneyDto {
  @IsNotEmpty()
  JourneyID: string;

  @IsNotEmpty()
  JobID: string;

  @IsNotEmpty()
  Status: string;

  @IsNotEmpty()
  AssignedDate: string;
}
