import { Module } from '@nestjs/common';
import { SapService } from './sap/sap.service';
import { SapController } from './sap/sap.controller';
import { AuthModule } from '../auth/auth.module';
import { B1ApiProcess } from './sap/api/b1-api.process';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from 'src/schemas/service-call/job.entity';
import { SocketGateway } from './socket/websocket.gateway';
import { User } from 'src/schemas/profile/user.entity';
import { WebsocketService } from './socket/websocket.service';

@Module({
  imports: [TypeOrmModule.forFeature([Job, User]), AuthModule],
  providers: [SapService, B1ApiProcess, SocketGateway, WebsocketService],
  controllers: [SapController],
  exports: [SapService, SocketGateway, WebsocketService],
})
export class IntegrationModule {}
