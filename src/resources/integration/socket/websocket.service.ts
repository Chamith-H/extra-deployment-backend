import { Injectable } from '@nestjs/common';
import { SocketGateway } from './websocket.gateway';
import { LogDto } from 'src/resources/profile/user/dto/LogDto';

@Injectable()
export class WebsocketService {
  constructor(private readonly socketGateway: SocketGateway) {}

  async getDbReport(dto: LogDto) {
    return await this.socketGateway.getDbLog(dto);
  }

  async handleLogout(employeeId: string) {
    return await this.socketGateway.handleLogout(employeeId);
  }
}
