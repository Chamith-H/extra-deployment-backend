import { Module } from '@nestjs/common';
import { IntegrationService } from './integration/integration.service';
import { IntegrationController } from './integration/integration.controller';
import { SocketService } from './socket/socket.service';
import { ActionService } from './action/action.service';

@Module({
  providers: [IntegrationService, SocketService, ActionService],
  controllers: [IntegrationController]
})
export class SettingModule {}
