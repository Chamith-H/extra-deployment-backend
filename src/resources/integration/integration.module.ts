import { Module } from '@nestjs/common';
import { SapService } from './sap/sap.service';
import { SapController } from './sap/sap.controller';
import { AuthModule } from '../auth/auth.module';
import { B1ApiProcess } from './sap/api/b1-api.process';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from 'src/schemas/service-call/job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job]), AuthModule],
  providers: [SapService, B1ApiProcess],
  controllers: [SapController],
  exports: [SapService],
})
export class IntegrationModule {}
