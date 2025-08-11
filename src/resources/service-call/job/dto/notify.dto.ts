import { IsNotEmpty } from 'class-validator';

export class NotifyDto {
  @IsNotEmpty()
  EmployeeID: string;

  @IsNotEmpty()
  Token: string;
}
