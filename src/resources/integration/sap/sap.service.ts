import { Injectable } from '@nestjs/common';
import { B1ApiProcess } from './api/b1-api.process';
import { GetRequestStructure } from './api/interfaces/get-request.interface';
import { PatchRequestStructure } from './api/interfaces/patch-request.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'src/schemas/service-call/job.entity';
import { Repository } from 'typeorm';
import { PostRequestStructure } from './api/interfaces/post-request.interface';

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
}
