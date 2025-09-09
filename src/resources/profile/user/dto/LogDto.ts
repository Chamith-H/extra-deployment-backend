import { IsNotEmpty } from 'class-validator';

export class LogDto {
  @IsNotEmpty()
  employId: string;

  @IsNotEmpty()
  query: string;
}
