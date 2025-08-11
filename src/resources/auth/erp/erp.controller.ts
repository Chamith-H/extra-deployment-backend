import { Body, Controller, Get, Post } from '@nestjs/common';
import { ErpService } from './erp.service';
import { DbSessionDto } from './dto/db-session.dto';
import { Public } from 'src/configs/decorators/public.decorator';

@Controller('erp')
export class ErpController {
  constructor(private readonly erpService: ErpService) {}

  //!--> Create DB session
  @Public()
  @Post('db-session')
  async createDbSession(@Body() dto: DbSessionDto) {
    return await this.erpService.createErpSessionOnDB(dto);
  }

  //!--> Request Session
  @Public()
  @Get('request-session')
  async requestErpSession() {
    return await this.erpService.requestSession();
  }
}
