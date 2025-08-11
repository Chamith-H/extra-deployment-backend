import { IsNotEmpty } from 'class-validator';

export class SelectedExpenseDto {
  @IsNotEmpty()
  target: string;

  @IsNotEmpty()
  value: string;
}
