import { IsNotEmpty } from 'class-validator';

export class FilterDateDto {
  @IsNotEmpty()
  year: string;

  @IsNotEmpty()
  month: string;
}
