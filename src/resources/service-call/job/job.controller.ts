import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { JobService } from './job.service';
import { JobDto } from './dto/job.dto';
import { Public } from 'src/configs/decorators/public.decorator';
import { GetEmployee } from 'src/configs/decorators/employee.decorator';
import { AcknowledgeJobDto } from './dto/acknowledgement.dto';
import { JobDocumentDto } from './dto/job-document.dto';
import { JobJourneyDto } from './dto/job-journey.dto';
import { CheckInDto } from './dto/checkin.dto';
import { JourneyDocumentDto } from './dto/journey-document.dto';
import { JourneyDto } from './dto/journey.dto';
import { StatusUpdateDto } from './dto/status-update.dto';
import { DateGetterDto } from './dto/date-getter.dto';
import { EndJourneyDto } from './dto/end-journey.dto';
import { FilterDateDto } from './dto/filter-job.dto';
import { UpdateRemarkDto } from './dto/update-remark.dto';
import { SampleCountDto } from './dto/sample-count.dto';
import { NotifyDto } from './dto/notify.dto';
import { Pagination } from 'src/configs/decorators/pagination.decorator';
import { PaginationModel } from 'src/configs/interfaces/pagination.model';
import { FilterObject } from 'src/configs/decorators/filter.decorator';
import { FilterWebJobDto } from './dto/filter-web-job.dto';
import { FilterWebJourneyDto } from './dto/filter-web-journey.dto';
import { SparePartDto } from './dto/spare-part.dto';
import { FilterServiceDto } from './dto/filter-service.dto';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  //!--> Save notification
  @Public()
  @Post('save-token')
  async saveNotifyToken(@Body() dto: NotifyDto) {
    return await this.jobService.saveNotifyToken(dto);
  }

  //!--> Send test notification
  @Public()
  @Get('send-notify')
  async sendNotify() {
    return await this.jobService.sendNotification(
      '124',
      '34456-5',
      'Hello World',
    );
  }

  //!--> Create new job
  @Public()
  @Post('create')
  async createJob(@Body() dto: JobDto) {
    return await this.jobService.creaateJob(dto);
  }

  //!--> Get jobs
  @Post('list')
  async getJobs(@Body() dto: FilterDateDto, @GetEmployee() employeeId: string) {
    return await this.jobService.getJobs(dto, employeeId);
  }

  //!--> Get non-completes
  @Get('non-completes')
  async getNonCompletedJobs(@GetEmployee() employeeId: string) {
    return await this.jobService.getNonCompletedJobs(employeeId);
  }

  //!--> Get journeys
  @Post('journey-list')
  async getJourneys(
    @Body() dto: FilterDateDto,
    @GetEmployee() employeeId: string,
  ) {
    return await this.jobService.getJourneys(dto, employeeId);
  }

  //!--> Get journey documents
  @Public()
  @Post('journey-docs')
  async getJourneyDocs(@Body() dto: any) {
    return await this.jobService.getJourneyDocuments(dto.journeyId);
  }

  //!--> Get job journeys
  @Public()
  @Post('job-journeys')
  async getJobJourneys(@Body() dto: any) {
    return await this.jobService.getInsideJourneyJobActions(dto.journeyId);
  }

  //!--> Get availbale journey
  @Get('available-journey')
  async getAvailableJourney(@GetEmployee() employeeId: string) {
    return await this.jobService.getAvailableJourney(employeeId);
  }

  //!--> Get selected journey
  @Post('c-selected-journey')
  async getSelectedJourney(@Body() dto: any) {
    return await this.jobService.getSelectedJourney(dto.journeyId);
  }

  //!--> Check in
  @Post('acknowledge')
  async giveAcknowledge(@Body() dto: AcknowledgeJobDto) {
    return await this.jobService.giveAcknowledgement(dto);
  }

  //!--> Save job documents
  @Post('add-job-documents')
  async createJobDocument(@Body() dto: JobDocumentDto) {
    return await this.jobService.createJobDocument(dto);
  }

  //!--> Create job journey
  @Post('add-job-journey')
  async createJobJourney(@Body() dto: JobJourneyDto) {
    return await this.jobService.createJobJourney(dto);
  }

  //!--> Check in
  @Post('check-in')
  async checkIn(@Body() dto: CheckInDto) {
    return await this.jobService.userCheckin(dto);
  }

  //!--> Save journey documents
  @Post('add-journey-documents')
  async createJourneyDocument(@Body() dto: JourneyDocumentDto) {
    return await this.jobService.createJourneyDocument(dto);
  }

  //!--> Create new journey
  @Post('create-journey')
  async createJourney(
    @Body() dto: JourneyDto,
    @GetEmployee() employee: string,
  ) {
    return await this.jobService.createJourney(dto, employee);
  }

  //!--> Change job status
  @Post('update-status')
  async changeStatus(@Body() dto: StatusUpdateDto) {
    return await this.jobService.updateStatus(dto);
  }

  //!--> Get today assigned jobs
  @Post('today-assigned')
  async getTodayAssignedJobs(
    @Body() dto: DateGetterDto,
    @GetEmployee() employeeId: string,
  ) {
    return await this.jobService.todayAssignedJobs(dto, employeeId);
  }

  //!--> Endjourney
  @Post('end-journey')
  async endJourney(@Body() dto: EndJourneyDto) {
    return await this.jobService.endJourney(dto);
  }

  //!--> Update remarks
  @Post('add-remarks')
  async updateRemarks(@Body() dto: UpdateRemarkDto) {
    return await this.jobService.updateRemark(dto);
  }

  //!--> Update sample count
  @Post('update-count')
  async updateSampleCount(@Body() dto: SampleCountDto) {
    return await this.jobService.updateSampleCount(dto);
  }

  //!--> Crete spare part
  @Post('create-part')
  async createPartRequest(
    @Body() dto: SparePartDto,
    @GetEmployee() employeeId: string,
  ) {
    return await this.jobService.createSparePartReuest(dto, Number(employeeId));
  }

  //!--> Get spare part
  @Get('get-parts/:id')
  async getPartRequests(@Param('id') id: string) {
    const parts = await this.jobService.getSparePartRequests(id);

    return parts;
  }

  //!--> Update consume
  @Post('update-consume')
  async updateConsumeCount(@Body() dto: any) {
    return await this.jobService.updateConsumeValues(dto.items);
  }

  //!--> Get business partners
  @Get('bps')
  async getBusinessPartners(@GetEmployee() employeeId: string) {
    return await this.jobService.get_businessPartners(Number(employeeId));
  }

  //!--> Get service history
  @Post('service-history')
  async getServiceHistory(
    @Body() dto: FilterServiceDto,
    @GetEmployee() employeeId: string,
  ) {
    return await this.jobService.getHistory(dto, employeeId);
  }

  //!--> Get schedulings from SAP
  @Public()
  @Get('sync-from-sap')
  async getServiceCallSchedulings() {
    return await this.jobService.getServiceCallSchedulings();
  }

  //!--> Paginate jobs
  @Public()
  @HttpCode(200)
  @Post('all')
  async getAll(
    @Pagination() pagination: PaginationModel,
    @FilterObject() dto: FilterWebJobDto,
  ) {
    return await this.jobService.getAll(dto, pagination);
  }

  //!--> get job journeys by job id
  @Public()
  @Get('job-actions/:id')
  async getJobActions(@Param('id') id: string) {
    return await this.jobService.getJobActions(id);
  }

  //!--> get job journeys by job id
  @Public()
  @Get('job-documents/:id')
  async getJobDocuments(@Param('id') id: string) {
    return await this.jobService.getJobDocuments(id);
  }

  //!--> Paginate journeys
  @Public()
  @HttpCode(200)
  @Post('all-journeys')
  async getAllJourneys(
    @Pagination() pagination: PaginationModel,
    @FilterObject() dto: FilterWebJourneyDto,
  ) {
    return await this.jobService.getAllJourneys(dto, pagination);
  }
}
