import { IsOptional } from 'class-validator';

export class FilterExpenseDto {
  @IsOptional()
  expenseID: any;

  @IsOptional()
  category: any;

  @IsOptional()
  referanceID: any;

  @IsOptional()
  type: any;

  @IsOptional()
  amount: any;

  @IsOptional()
  technician: any;

  @IsOptional()
  createdDate: any;

  @IsOptional()
  status: any;

  @IsOptional()
  actions: any;
}
