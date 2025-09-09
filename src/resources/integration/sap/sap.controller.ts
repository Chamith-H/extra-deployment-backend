import { Controller, Get, HttpCode, Post } from '@nestjs/common';
import { SapService } from './sap.service';
import { Pagination } from 'src/configs/decorators/pagination.decorator';
import { PaginationModel } from 'src/configs/interfaces/pagination.model';
import { FilterObject } from 'src/configs/decorators/filter.decorator';
import { FilterItemDto } from './dto/filter-item.dto';
import { FilterWarehouseDto } from './dto/filter-warehouse.dto';

@Controller('sap')
export class SapController {
  constructor(private readonly sapService: SapService) {}

  //!--> Get Items | With pagination............................................................|
  @HttpCode(200)
  @Post('all-item')
  async getItemData(
    @Pagination() pagination: PaginationModel,
    @FilterObject() dto: FilterItemDto,
  ) {
    return await this.sapService.handleGetItems(dto, pagination);
  }

  //!--> Get Warehouses | With pagination............................................................|
  @HttpCode(200)
  @Post('all-warehouse')
  async getWarehouseData(
    @Pagination() pagination: PaginationModel,
    @FilterObject() dto: FilterWarehouseDto,
  ) {
    return await this.sapService.handleGetWarehouses(dto, pagination);
  }
}
