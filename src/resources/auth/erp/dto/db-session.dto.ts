import { IsNotEmpty } from 'class-validator';

export class DbSessionDto {
  @IsNotEmpty()
  target: string;

  @IsNotEmpty()
  sessionToken: string;

  @IsNotEmpty()
  date: Date;
}
