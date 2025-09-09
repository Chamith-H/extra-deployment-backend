import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/schemas/profile/user.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { Access } from 'src/schemas/profile/permission.entity';
import * as argon from 'argon2';
import { JwtPayload } from './jwt/jwt.payload';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  //!--> Login
  async login(dto: LoginDto) {
    if (dto.deviceID === 'EMPTY') {
      throw new UnauthorizedException('Cannot find your device!.');
    }

    const user = await this.userRepository.findOne({
      where: { employId: dto.username },
      relations: ['role'],
    });

    if (!user) {
      throw new BadRequestException('Username not found!');
    }

    const pwdMatches = await argon.verify(user.password, dto.password);

    if (!pwdMatches) {
      throw new UnauthorizedException('Incorrect credentials!');
    }

    if (
      !user.status ||
      !user.role.status ||
      !user.role.accesses ||
      user.role.accesses.length === 0
    ) {
      throw new UnauthorizedException('Unauthorized access!');
    }

    //
    if (dto.requestFrom === 'MOBILE') {
      if (user.deviceId === '' || !user.deviceId) {
        await this.userRepository.update(
          { id: user.id },
          {
            deviceId: dto.deviceID,
          },
        );
      } else {
        if (user.deviceId !== dto.deviceID) {
          throw new UnauthorizedException(
            'This account is already registered with another device!.',
          );
        }
      }
    }

    const accessNumbers = user.role.accesses.map(
      (access: Access) => access.checker,
    );

    const payload: JwtPayload = {
      id: user.id,
      employId: user.employId,
    };

    const userData = {
      appToken: await this.jwtService.sign(payload),
      userName: user.name,
      userId: `${user.id}`,
      roleName: user.role.name,
      roleId: `${user.role.id}`,
      employId: `${user.employId}`,
      accessArray: JSON.stringify(accessNumbers),
    };

    return userData;
  }

  //!--> Validate
  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findOne({
      where: { id: payload.id },
      relations: ['role'],
    });

    if (!user) {
      throw new BadRequestException('User not found!');
    }

    if (
      !user.status ||
      !user.role.status ||
      !user.role.accesses ||
      user.role.accesses.length === 0
    ) {
      throw new UnauthorizedException('Unauthorized access!');
    }

    if (!user.deviceId || user.deviceId === '') {
      throw new UnauthorizedException('Please login with a valid device!');
    }

    const accessNumbers = user.role.accesses.map(
      (access: Access) => access.checker,
    );

    const userData = {
      id: user.id,
      accesses: JSON.stringify(accessNumbers),
    };

    return userData;
  }
}
