import { IsOptional } from 'class-validator';

export class FilterExpenseDto {
  @IsOptional()
  ExpenseID: any;
}
