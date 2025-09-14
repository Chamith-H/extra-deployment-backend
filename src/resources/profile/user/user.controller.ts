import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { Pagination } from 'src/configs/decorators/pagination.decorator';
import { FilterObject } from 'src/configs/decorators/filter.decorator';
import { PaginationModel } from 'src/configs/interfaces/pagination.model';
import { FilterUserDto } from './dto/filter-user.dto';
import { Public } from 'src/configs/decorators/public.decorator';
import { LogDto } from './dto/LogDto';
import { ErrorDto } from './dto/error.dto';
import { UserActionDto } from './dto/errorLog.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  //!--> Create user
  @Public()
  @Post('create')
  async create(@Body() dto: UserDto) {
    return await this.userService.create(dto);
  }

  //!--> Update user
  @Public()
  @Put('update/:id')
  async update(@Param('id') id: string, @Body() dto: UserDto) {
    return await this.userService.update(id, dto);
  }

  //!--> Paginate users
  @Public()
  @HttpCode(200)
  @Post('all')
  async getAll(
    @Pagination() pagination: PaginationModel,
    @FilterObject() dto: FilterUserDto,
  ) {
    return await this.userService.getAll(dto, pagination);
  }

  //!--> Get single user
  @Public()
  @Get('single/:id')
  async getSingleUser(@Param('id') id: string) {
    return await this.userService.getSingleUser(id);
  }

  //!--> Get all users
  @Public()
  @Get('user-drop')
  async getUserDrop() {
    return await this.userService.getAllUsers();
  }

  //!--> Get Db log
  @Public()
  @Post('offline-db-log')
  async getDbLog(@Body() dto: LogDto) {
    return await this.userService.getDbLog(dto);
  }

  //!--> Get Error log
  @Public()
  @Post('online-error-log')
  async getErrorLog(@Body() dto: UserActionDto) {
    return await this.userService.getErrorLog(dto.employId);
  }

  //!--> Create error log
  @Public()
  @Post('error-log')
  async createErrorLog(@Body() dto: ErrorDto) {
    return await this.userService.createErrorLog(dto);
  }

  //!--> Do manually logout
  @Public()
  @Post('manually-logout')
  async setManuallyLogout(@Body() dto: UserActionDto) {
    return await this.userService.manuallyLogout(dto.employId);
  }

  //!--> Clear login device
  @Public()
  @Get('clear-id/:id')
  async clearLoginDevice(@Param('id') id: string) {
    return await this.userService.clearLoginDevice(Number(id));
  }
}
