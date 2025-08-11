import { Injectable } from '@nestjs/common';
import { ExpenseDocumentDto } from './dto/expense-document.dto';
import { ExpenseDto } from './dto/expense.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from 'src/schemas/expense/expense.entity';
import { Like, Repository } from 'typeorm';
import { ExpenseDocument } from 'src/schemas/expense/expense-document.entity';
import { SelectedExpenseDto } from './dto/selected-expense.dto';
import { FilterDateDto } from '../job/dto/filter-job.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';
import { PaginationModel } from 'src/configs/interfaces/pagination.model';
import { PaginationService } from 'src/shared/table-paginator.service';
import { User } from 'src/schemas/profile/user.entity';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,

    @InjectRepository(ExpenseDocument)
    private readonly expenseDocumentRepository: Repository<ExpenseDocument>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private paginationService: PaginationService,
  ) {}

  //!--> Create new expense document
  async createNewExpenseDocument(dto: ExpenseDocumentDto) {
    const expenseDocument = this.expenseDocumentRepository.create(dto);
    const response = await this.expenseDocumentRepository.save(expenseDocument);

    if (response) {
      return {
        message: 'User role created successfully!',
      };
    }
  }

  //!--> Create new Expense
  async createNewExpense(dto: ExpenseDto, employee: string) {
    const expense = this.expenseRepository.create({
      ...dto,
      CreatedBy: employee,
      Status: 'Pending',
    });
    const response = await this.expenseRepository.save(expense);

    if (response) {
      return {
        message: 'User role created successfully!',
      };
    }
  }

  //!--> Get seleted expense list
  async getSelectedExpens(dto: SelectedExpenseDto, employee: string) {
    let filterObj = null;

    if (dto.target === 'JourneyID') {
      filterObj = { JourneyID: dto.value, CreatedBy: employee };
    } else if (dto.target === 'JobID') {
      filterObj = { JobID: dto.value, CreatedBy: employee };
    } else {
      filterObj = { CreatedBy: employee };
    }

    const data = await this.expenseRepository.find({ where: filterObj });
    return data;
  }

  //!--> Get monthly expenses
  async getMonthlyExpenses(dto: FilterDateDto, employee: string) {
    const { year, month } = dto;

    const data = await this.expenseRepository
      .createQueryBuilder('expense')
      .where(
        `YEAR(CONVERT(date, expense.CreatedDate, 120)) = :year AND MONTH(CONVERT(date, expense.CreatedDate, 120)) = :month AND expense.CreatedBy = :technician`,
        {
          year: Number(year),
          month: Number(month),
          technician: employee,
        },
      )
      .getMany();

    return data;
  }

  //!--> Get pagination
  async getAll(dto: FilterExpenseDto, pagination: PaginationModel) {
    if (dto.ExpenseID) {
      dto.ExpenseID = Like(`%${dto.ExpenseID}%`);
    }

    const list = await this.expenseRepository.find({
      where: dto,
      take: pagination.limit,
      skip: pagination.offset,
      order: { id: 'DESC' },
    });

    return await this.paginationService.pageData(
      list,
      this.expenseRepository,
      dto,
      pagination,
    );
  }

  //!--> Get single expense details
  async getSingleExpense(expenseId: string) {
    const expense = await this.expenseRepository.findOne({
      where: { ExpenseID: expenseId },
    });

    const expenseDocuments = await this.expenseDocumentRepository.find({
      where: { ExpenseID: expenseId },
    });

    const userData = await this.userRepository.findOne({
      where: { employId: expense.CreatedBy },
      relations: ['role'],
    });

    const response = {
      expenseData: expense,
      expenseDocs: expenseDocuments,
      expenseUser: userData,
    };

    return response;
  }

  //!--> Approve expense
  async approveExpense(expenseId: string) {
    const updater = await this.expenseRepository.update(
      { ExpenseID: expenseId },
      {
        Status: 'Approved',
      },
    );

    if (updater) {
      return {
        message: 'Expense approved successfully!',
      };
    }
  }

  //!--> Approve expense
  async rejectExpense(expenseId: string) {
    const updater = await this.expenseRepository.update(
      { ExpenseID: expenseId },
      {
        Status: 'Rejected',
      },
    );

    if (updater) {
      return {
        message: 'Expense rejected successfully!',
      };
    }
  }
}
