import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleDto } from './dto/role.dto';
import { Pagination } from 'src/configs/decorators/pagination.decorator';
import { FilterObject } from 'src/configs/decorators/filter.decorator';
import { FilterRoleDto } from './dto/filter-role.dto';
import { PaginationModel } from 'src/configs/interfaces/pagination.model';
import { AddPermissionDto } from './dto/add-permission.dto';
import { Public } from 'src/configs/decorators/public.decorator';

@Controller('role')
export class RoleController {
  constructor(private roleService: RoleService) {}

  //!--> Create role
  @Public()
  @Post('create')
  async create(@Body() dto: RoleDto) {
    return await this.roleService.create(dto);
  }

  //!--> Paginate roles
  @Public()
  @HttpCode(200)
  @Post('all')
  async getAll(
    @Pagination() pagination: PaginationModel,
    @FilterObject() dto: FilterRoleDto,
  ) {
    return await this.roleService.getAll(dto, pagination);
  }

  //!--> Get roles dropdown
  @Public()
  @Get('roles')
  @Public()
  async getDropdown() {
    return await this.roleService.getDropdown();
  }

  //!--> Get permissioned roles
  @Public()
  @Get('permissioned-roles')
  async getPermissionedRoles() {
    return await this.roleService.getPermissionRoles();
  }

  //!--> Add permission
  @Public()
  @Post('add-permission')
  async addPermission(@Body() dto: AddPermissionDto) {
    return await this.roleService.addPermission(dto);
  }
}
