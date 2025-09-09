import { Module } from '@nestjs/common';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { RoleService } from './role/role.service';
import { RoleController } from './role/role.controller';
import { PermissionService } from './permission/permission.service';
import { PermissionController } from './permission/permission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/schemas/profile/role.entity';
import { PaginationService } from 'src/shared/table-paginator.service';
import { User } from 'src/schemas/profile/user.entity';
import { EmailSenderService } from 'src/shared/email-sender.service';
import { Access } from 'src/schemas/profile/permission.entity';
import { IntegrationModule } from '../integration/integration.module';
import { ErrorLog } from 'src/schemas/common/error-log.entity';
import { DateGeneratorService } from 'src/shared/date-generator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, User, Access, ErrorLog]),
    IntegrationModule,
  ],
  providers: [
    UserService,
    RoleService,
    PermissionService,
    PaginationService,
    EmailSenderService,
    DateGeneratorService,
  ],
  controllers: [UserController, RoleController, PermissionController],
})
export class ProfileModule {}
