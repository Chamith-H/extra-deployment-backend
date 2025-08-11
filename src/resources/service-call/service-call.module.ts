import { Module } from '@nestjs/common';
import { JobService } from './job/job.service';
import { JobController } from './job/job.controller';
import { ExpenseService } from './expense/expense.service';
import { ExpenseController } from './expense/expense.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from 'src/schemas/service-call/job.entity';
import { PaginationService } from 'src/shared/table-paginator.service';
import { JobDocument } from 'src/schemas/service-call/job-document.entity';
import { JobJourney } from 'src/schemas/service-call/job-journey.entity';
import { JourneyDocument } from 'src/schemas/service-call/journey-document.entity';
import { Journey } from 'src/schemas/service-call/journey.entity';
import { ExpenseDocument } from 'src/schemas/expense/expense-document.entity';
import { Expense } from 'src/schemas/expense/expense.entity';
import { IntegrationModule } from '../integration/integration.module';
import { DateGeneratorService } from 'src/shared/date-generator.service';
import { NotificationT } from 'src/schemas/setting/notification.entity';
import { User } from 'src/schemas/profile/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Job,
      JobDocument,
      JobJourney,
      JourneyDocument,
      Journey,
      ExpenseDocument,
      Expense,
      NotificationT,
      User,
    ]),
    IntegrationModule,
  ],
  providers: [
    JobService,
    ExpenseService,
    PaginationService,
    DateGeneratorService,
  ],
  controllers: [JobController, ExpenseController],
})
export class ServiceCallModule {}
