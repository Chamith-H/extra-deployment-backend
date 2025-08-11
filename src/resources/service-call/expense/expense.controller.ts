import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ExpenseDocumentDto } from './dto/expense-document.dto';
import { ExpenseDto } from './dto/expense.dto';
import { GetEmployee } from 'src/configs/decorators/employee.decorator';
import { SelectedExpenseDto } from './dto/selected-expense.dto';
import { FilterDateDto } from '../job/dto/filter-job.dto';
import { Public } from 'src/configs/decorators/public.decorator';
import { Pagination } from 'src/configs/decorators/pagination.decorator';
import { PaginationModel } from 'src/configs/interfaces/pagination.model';
import { FilterObject } from 'src/configs/decorators/filter.decorator';
import { FilterExpenseDto } from './dto/filter-expense.dto';

@Controller('expense')
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  @Post('add-expense-documents')
  async createExpenseDocuments(@Body() dto: ExpenseDocumentDto) {
    return await this.expenseService.createNewExpenseDocument(dto);
  }

  @Post('create')
  async createExpense(
    @Body() dto: ExpenseDto,
    @GetEmployee() employee: string,
  ) {
    return await this.expenseService.createNewExpense(dto, employee);
  }

  @Post('selected-expenses')
  async getSelectedExpenses(
    @Body() dto: SelectedExpenseDto,
    @GetEmployee() employee: string,
  ) {
    return await this.expenseService.getSelectedExpens(dto, employee);
  }

  @Post('monthly-expenses')
  async getMonthlyExpenses(
    @Body() dto: FilterDateDto,
    @GetEmployee() employee: string,
  ) {
    return await this.expenseService.getMonthlyExpenses(dto, employee);
  }

  //!--> Paginate roles
  @Public()
  @HttpCode(200)
  @Post('all')
  async getAll(
    @Pagination() pagination: PaginationModel,
    @FilterObject() dto: FilterExpenseDto,
  ) {
    return await this.expenseService.getAll(dto, pagination);
  }

  @Public()
  @Post('expense-view')
  async viewExpense(@Body() dto: any) {
    return await this.expenseService.getSingleExpense(dto.expID);
  }

  @Public()
  @Post('approve-expense')
  async approveExpense(@Body() dto: any) {
    return await this.expenseService.approveExpense(dto.expID);
  }
}
