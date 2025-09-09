import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LogDto } from 'src/resources/profile/user/dto/LogDto';
import { User } from 'src/schemas/profile/user.entity';
import { Repository } from 'typeorm';

@WebSocketGateway({ cors: true })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  async handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('registerEmployee')
  async handleRegisterEmployee(
    @MessageBody() data: { employeeId: string; socketId: string },
  ) {
    if (data.employeeId && data.socketId) {
      const user = await this.userRepository.findOne({
        where: { employId: data.employeeId },
      });

      if (user) {
        await this.userRepository.update(
          { employId: data.employeeId },
          { socketId: data.socketId },
        );
      }
    }
  }

  async handleLogout(employeeId: string) {
    const user = await this.userRepository.findOne({
      where: { employId: employeeId },
    });

    if (user && user.socketId) {
      // Send a message to this user's socket
      this.server.to(user.socketId).emit('logout', {
        text: 'logout',
      });

      console.log(
        `Logout action sent to ${employeeId} via socket ${user.socketId}`,
      );
    } else {
      console.log(`No connected socket for employee ${employeeId}`);
    }
  }

  async getDbLog(dto: LogDto) {
    const user = await this.userRepository.findOne({
      where: { employId: dto.employId },
    });

    if (!user) {
      throw new BadRequestException('User not found!');
    }

    if (user && user.socketId === '') {
      throw new BadRequestException('User not a client!');
    }

    if (user && user.socketId) {
      return await new Promise((resolve, reject) => {
        this.server
          .to(user.socketId)
          .timeout(10000)
          .emit('dbquery', { query: dto.query }, (err: any, response: any) => {
            if (err) {
              reject(new BadRequestException('Client did not respond in time'));
            } else {
              resolve(response); // this will return client’s reply
            }
          });
      });
    }

    return null;
  }
}
