import { Injectable } from '@nestjs/common';
import { B1ApiProcess } from './api/b1-api.process';
import { GetRequestStructure } from './api/interfaces/get-request.interface';
import { PatchRequestStructure } from './api/interfaces/patch-request.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'src/schemas/service-call/job.entity';
import { Repository } from 'typeorm';
import { PostRequestStructure } from './api/interfaces/post-request.interface';
import { PaginationRequestStructure } from './api/interfaces/pagination-request.interface';
import { PaginationModel } from 'src/configs/interfaces/pagination.model';
import { FilterItemDto } from './dto/filter-item.dto';
import { FilterWarehouseDto } from './dto/filter-warehouse.dto';

@Injectable()
export class SapService {
  constructor(
    private readonly sapAPI: B1ApiProcess,

    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  //!--> Get service call schedulings
  async getServiceCallSchedulings() {
    const request: GetRequestStructure = {
      path: "SQLQueries('SERApp_schedules')",
      logic: '/List',
    };

    const schedules = await this.sapAPI.request_GET(request);
    return schedules;
  }

  //!--> Add sync to service call
  async dataGettingComplete(callID: number, line: number) {
    const request: PatchRequestStructure = {
      id: callID,
      path: 'ServiceCalls',
      body: {
        ServiceCallSchedulings: [
          {
            LineNum: line,
            U_SERApp_Synced: 'Y',
          },
        ],
      },
    };

    return await this.sapAPI.request_PATCH(request);
  }

  //!--> Add sync to service call
  async updateJob(jobId: string, body: any) {
    const schedule = await this.jobRepository.findOne({
      where: { JobID: jobId },
    });

    const request: PatchRequestStructure = {
      id: schedule.SrcvCallID,
      path: 'ServiceCalls',
      body: {
        ServiceCallSchedulings: [
          {
            LineNum: schedule.Line,
            ...body,
          },
        ],
      },
    };

    return await this.sapAPI.request_PATCH(request);
  }

  //!--> Get service call resolution
  async getServiceCallResolution(callID: number) {
    const request: PostRequestStructure = {
      path: "SQLQueries('SERApp_Resolution')/List",
      body: { ParamList: `parentEntry=${callID}` },
    };

    const schedules = await this.sapAPI.request_POST(request);
    return schedules;
  }

  //!--> Update service call data
  async updateServiceCall(callID: number, body: any) {
    const request: PatchRequestStructure = {
      id: callID,
      path: 'ServiceCalls',
      body: body,
    };

    return await this.sapAPI.request_PATCH(request);
  }

  //!--> handle get items
  async handleGetItems(dto: FilterItemDto, pagination: PaginationModel) {
    let filterString = '';
    let counterString = '';

    let queryArray: string[] = [];

    const isEmptyFilter = Object.keys(dto).length === 0;

    if (!isEmptyFilter) {
      if (dto.ItemCode) {
        queryArray.push(`substringof('${dto.ItemCode}',ItemCode)`);
      }

      const queryCount: number = queryArray.length;

      const filterQuery = queryArray.map((eachFilter, index) => {
        if (queryCount === 1 || index === queryCount - 1) {
          return eachFilter;
        } else {
          return `${eachFilter} and`;
        }
      });

      const finalQuery: string = filterQuery.join(' ');

      filterString = '&$filter=' + finalQuery;
      counterString = '?$filter=' + finalQuery;
    }

    const pagingData = await this.getItems(
      pagination.limit,
      pagination.offset,
      pagination.page,
      filterString,
      counterString,
    );

    return pagingData;
  }

  //!--> Get item master data
  async getItems(
    limit: number,
    skip: number,
    page: number,
    filter: string,
    counter: string,
  ) {
    const paginationEndpoint: PaginationRequestStructure = {
      path: 'Items',
      datalogic:
        ` & $select=ItemCode,ItemName & $orderby=CreateDate desc` + filter,
      counterlogic: counter,
      limit: limit,
      skip: skip,
      page: page,
    };

    return await this.sapAPI.pagination_GET(paginationEndpoint);
  }

  //!--> handle get items
  async handleGetWarehouses(
    dto: FilterWarehouseDto,
    pagination: PaginationModel,
  ) {
    let filterString = '';
    let counterString = '';

    let queryArray: string[] = [];

    const isEmptyFilter = Object.keys(dto).length === 0;

    if (!isEmptyFilter) {
      if (dto.WarehouseCode) {
        queryArray.push(`substringof('${dto.WarehouseCode}',WarehouseCode)`);
      }

      const queryCount: number = queryArray.length;

      const filterQuery = queryArray.map((eachFilter, index) => {
        if (queryCount === 1 || index === queryCount - 1) {
          return eachFilter;
        } else {
          return `${eachFilter} and`;
        }
      });

      const finalQuery: string = filterQuery.join(' ');

      filterString = '&$filter=' + finalQuery;
      counterString = '?$filter=' + finalQuery;
    }

    const pagingData = await this.getWarehouses(
      pagination.limit,
      pagination.offset,
      pagination.page,
      filterString,
      counterString,
    );

    return pagingData;
  }

  //!--> Get item master data
  async getWarehouses(
    limit: number,
    skip: number,
    page: number,
    filter: string,
    counter: string,
  ) {
    const paginationEndpoint: PaginationRequestStructure = {
      path: 'Warehouses',
      datalogic: ` & $select=WarehouseCode,WarehouseName` + filter,
      counterlogic: counter,
      limit: limit,
      skip: skip,
      page: page,
    };

    return await this.sapAPI.pagination_GET(paginationEndpoint);
  }
}
