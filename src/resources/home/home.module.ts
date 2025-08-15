import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard/dashboard.service';
import { DashboardController } from './dashboard/dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from 'src/schemas/service-call/job.entity';
import { User } from 'src/schemas/profile/user.entity';
import { Expense } from 'src/schemas/expense/expense.entity';
import { Journey } from 'src/schemas/service-call/journey.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Expense, User, Journey])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class HomeModule {}
