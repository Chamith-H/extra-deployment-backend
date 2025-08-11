import { IsNotEmpty, IsOptional } from 'class-validator';

export class ExpenseDto {
  @IsNotEmpty()
  ExpenseID: string;

  @IsNotEmpty()
  JobID: string;

  @IsNotEmpty()
  JourneyID: string;

  @IsNotEmpty()
  Type: string;

  @IsNotEmpty()
  Amount: string;

  @IsOptional()
  Description: string;

  @IsNotEmpty()
  CreatedDate: string;
}
