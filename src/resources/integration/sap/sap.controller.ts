import { Controller, Get } from '@nestjs/common';
import { SapService } from './sap.service';

@Controller('sap')
export class SapController {
  constructor(private readonly sapService: SapService) {}
}
