import { IsNotEmpty, IsOptional } from 'class-validator';

export class AcknowledgeJobDto {
  @IsNotEmpty()
  JobID: string;

  @IsNotEmpty()
  Acknowledgement: string;

  @IsNotEmpty()
  AcknowledgementDateTime: string;

  @IsNotEmpty()
  AcknowledgementLat: string;

  @IsNotEmpty()
  AcknowledgementLong: string;

  @IsOptional()
  AcknowledgementReason: string;

  @IsNotEmpty()
  FinalStatus: string;
}
