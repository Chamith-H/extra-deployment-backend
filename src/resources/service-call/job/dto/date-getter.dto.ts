import { IsNotEmpty } from 'class-validator';

export class DateGetterDto {
  @IsNotEmpty()
  filterDate: string;
}
