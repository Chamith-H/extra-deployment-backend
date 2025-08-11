import { IsNotEmpty } from 'class-validator';

export class SampleCountDto {
  @IsNotEmpty()
  JobID: string;

  @IsNotEmpty()
  Count: string;
}
