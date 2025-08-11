import { Body, Controller, Get, Post } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionDto } from './dto/create-permission.dto';
import { Public } from 'src/configs/decorators/public.decorator';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  //!--> Create permission
  @Public()
  @Post('create')
  async createPermission(@Body() dto: PermissionDto) {
    return await this.permissionService.createPermission(dto);
  }

  //!-->
  @Public()
  @Get('all')
  async getPermissions() {
    return await this.permissionService.getPermissions();
  }
}
