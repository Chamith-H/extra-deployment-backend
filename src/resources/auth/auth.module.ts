import { Module } from '@nestjs/common';
import { AccountService } from './account/account.service';
import { AccountController } from './account/account.controller';
import { ErpService } from './erp/erp.service';
import { ErpController } from './erp/erp.controller';
import { User } from 'src/schemas/profile/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ErpSession } from 'src/schemas/common/erp-session.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './account/jwt/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([User, ErpSession]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '100y' },
    }),
  ],
  providers: [AccountService, ErpService, JwtStrategy],
  controllers: [AccountController, ErpController],
  exports: [ErpService],
})
export class AuthModule {}
