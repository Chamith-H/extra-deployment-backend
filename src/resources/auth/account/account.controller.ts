import { Body, Controller, Post } from '@nestjs/common';
import { AccountService } from './account.service';
import { LoginDto } from './dto/login.dto';
import { Public } from 'src/configs/decorators/public.decorator';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  //!--> login
  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.accountService.login(dto);
  }
}
