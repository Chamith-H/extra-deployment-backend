import { IsNotEmpty } from 'class-validator';

export class FilterServiceDto {
  @IsNotEmpty()
  year: string;

  @IsNotEmpty()
  month: string;

  @IsNotEmpty()
  bp: string;
}
