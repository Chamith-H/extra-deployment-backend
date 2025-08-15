import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Public } from 'src/configs/decorators/public.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Public()
  @Get('dash-data')
  async getDashData() {
    return await this.dashboardService.getDashboardData();
  }
}
