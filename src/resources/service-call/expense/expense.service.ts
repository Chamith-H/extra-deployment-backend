import { Injectable } from '@nestjs/common';
import { ExpenseDocumentDto } from './dto/expense-document.dto';
import { ExpenseDto } from './dto/expense.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from 'src/schemas/expense/expense.entity';
import { Between, FindOptionsWhere, Like, Not, Repository } from 'typeorm';
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

  //!--> Get seleted expense list to web
  async getSelectedExpensToWeb(dto: SelectedExpenseDto) {
    let filterObj = null;

    if (dto.target === 'JourneyID') {
      filterObj = { JourneyID: dto.value };
    } else if (dto.target === 'JobID') {
      filterObj = { JobID: dto.value };
    } else {
      filterObj = {};
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
    const where: FindOptionsWhere<Expense> = {};

    if (dto.expenseID) {
      where.ExpenseID = Like(`%${dto.expenseID}%`);
    }
    if (dto.category) {
      if (dto.category === 'Jobs') {
        where.JobID = Not('');
      } else if (dto.category === 'Journeys') {
        where.JourneyID = Not('');
      } else {
        where.JobID = '';
        where.JourneyID = '';
      }
    }
    if (dto.referanceID) {
      // reference can be JobID or JourneyID
      where.JobID = Like(`%${dto.referanceID}%`);
      // 👉 if you want to check both JobID and JourneyID, you’ll need OR in QB instead of here
    }
    if (dto.type) {
      where.Type = Like(`%${dto.type}%`);
    }
    if (dto.amount) {
      where.Amount = Like(`%${dto.amount}%`);
    }
    if (dto.status) {
      where.Status = Like(`%${dto.status}%`);
    }
    if (dto.createdDate) {
      where.CreatedDate = Between(
        `${dto.createdDate}T00:00:00`,
        `${dto.createdDate}T23:59:59`,
      );
    }
    if (dto.technician) {
      // since CreatedBy is string, we’ll filter via join instead of here
    }

    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoin(User, 'user', 'expense.CreatedBy = user.employId')
      .addSelect(['user.name AS createdByName'])
      .addSelect([
        'expense.id AS id',
        'expense.ExpenseID AS ExpenseID',
        'expense.JobID AS JobID',
        'expense.JourneyID AS JourneyID',
        'expense.Type AS Type',
        'expense.Amount AS Amount',
        'expense.Description AS Description',
        'expense.CreatedDate AS CreatedDate',
        'expense.CreatedBy AS CreatedBy',
        'expense.Status AS Status',
      ])
      .where(where);

    // sorting
    if (dto.actions === 'ASC_ID') {
      query.orderBy('expense.id', 'ASC');
    } else if (dto.actions === 'DESC_ID') {
      query.orderBy('expense.id', 'DESC');
    } else if (dto.actions === 'ASC_ExpenseID') {
      query.orderBy('expense.ExpenseID', 'ASC');
    } else if (dto.actions === 'DESC_ExpenseID') {
      query.orderBy('expense.ExpenseID', 'DESC');
    } else if (dto.actions === 'ASC_Amount') {
      query.orderBy('CAST(expense.Amount AS float)', 'ASC');
    } else if (dto.actions === 'DESC_Amount') {
      query.orderBy('CAST(expense.Amount AS float)', 'DESC');
    } else if (dto.actions === 'ASC_CDate') {
      query.orderBy('expense.CreatedDate', 'ASC');
    } else if (dto.actions === 'DESC_CDate') {
      query.orderBy('expense.CreatedDate', 'DESC');
    } else {
      query.orderBy('expense.id', 'DESC');
    }

    query.take(pagination.limit).skip(pagination.offset);

    const list = await query.getRawMany();

    return await this.paginationService.pageData(
      list,
      this.expenseRepository,
      where,
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
}
