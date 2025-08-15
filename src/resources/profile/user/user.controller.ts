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
}
