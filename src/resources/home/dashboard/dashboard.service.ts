import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from 'src/schemas/expense/expense.entity';
import { User } from 'src/schemas/profile/user.entity';
import { Job } from 'src/schemas/service-call/job.entity';
import { Journey } from 'src/schemas/service-call/journey.entity';
import { In, Not, Repository } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,

    @InjectRepository(Journey)
    private readonly journeyRepository: Repository<Journey>,

    @InjectRepository(Expense)
    private readonly expesesRepository: Repository<Expense>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getDashboardData() {
    const counts = {
      users: await this.userRepository.count(),
      journeys: await this.journeyRepository.count(),
      jobs: await this.jobRepository.count(),
      expenses: await this.expesesRepository.count(),
    };

    const statuses = {
      Open: await this.jobRepository.count({ where: { FinalStatus: 'Open' } }),
      Accepted: await this.jobRepository.count({
        where: { FinalStatus: 'Accepted' },
      }),
      CheckedIN: await this.jobRepository.count({
        where: { FinalStatus: 'Checked-In' },
      }),
      InProgress: await this.jobRepository.count({
        where: { FinalStatus: 'In-Progress' },
      }),
      Hold: await this.jobRepository.count({ where: { FinalStatus: 'Hold' } }),
      Completed: await this.jobRepository.count({
        where: { FinalStatus: 'Completed' },
      }),
      Checkout: await this.jobRepository.count({
        where: { FinalStatus: 'Completed and Checkout' },
      }),
    };

    const openJobs = await this.jobRepository.find({});

    return {
      counts: counts,
      statuses: statuses,
      openJobs: openJobs,
    };
  }
}
