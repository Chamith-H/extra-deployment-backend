import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'src/schemas/service-call/job.entity';
import { Like, Repository } from 'typeorm';
import { JobDto } from './dto/job.dto';
import { AcknowledgeJobDto } from './dto/acknowledgement.dto';
import { JobDocument } from 'src/schemas/service-call/job-document.entity';
import { JobDocumentDto } from './dto/job-document.dto';
import { JobJourney } from 'src/schemas/service-call/job-journey.entity';
import { JobJourneyDto } from './dto/job-journey.dto';
import { CheckInDto } from './dto/checkin.dto';
import { JourneyDocument } from 'src/schemas/service-call/journey-document.entity';
import { JourneyDocumentDto } from './dto/journey-document.dto';
import { JourneyDto } from './dto/journey.dto';
import { Journey } from 'src/schemas/service-call/journey.entity';
import { StatusUpdateDto } from './dto/status-update.dto';
import { DateGetterDto } from './dto/date-getter.dto';
import { EndJourneyDto } from './dto/end-journey.dto';
import { FilterDateDto } from './dto/filter-job.dto';
import { UpdateRemarkDto } from './dto/update-remark.dto';
import { SapService } from 'src/resources/integration/sap/sap.service';
import { DateGeneratorService } from 'src/shared/date-generator.service';
import { SampleCountDto } from './dto/sample-count.dto';
import { Cron } from '@nestjs/schedule';
import { NotificationT } from 'src/schemas/setting/notification.entity';
import { NotifyDto } from './dto/notify.dto';
import Expo from 'expo-server-sdk';
import { FilterWebJobDto } from './dto/filter-web-job.dto';
import { PaginationModel } from 'src/configs/interfaces/pagination.model';
import { PaginationService } from 'src/shared/table-paginator.service';
import { FilterWebJourneyDto } from './dto/filter-web-journey.dto';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,

    @InjectRepository(JobDocument)
    private readonly jobDocumentRepository: Repository<JobDocument>,

    @InjectRepository(JobJourney)
    private readonly jobJourneyRepository: Repository<JobJourney>,

    @InjectRepository(JourneyDocument)
    private readonly journeyDocumentRepository: Repository<JourneyDocument>,

    @InjectRepository(Journey)
    private readonly journeyRepository: Repository<Journey>,

    @InjectRepository(NotificationT)
    private readonly notifyRepository: Repository<NotificationT>,

    private readonly sapService: SapService,
    private readonly paginationService: PaginationService,
    private readonly dateGeneratorService: DateGeneratorService,
  ) {}

  private expo = new Expo();

  //!--> Save notify token
  async saveNotifyToken(dto: NotifyDto) {
    const isExist = await this.notifyRepository.findOne({
      where: { EmployeeID: dto.EmployeeID },
    });

    if (!isExist) {
      const notify = this.notifyRepository.create(dto);
      const response = await this.notifyRepository.save(notify);

      return response;
    } else {
      const updater = await this.notifyRepository.update(
        { EmployeeID: dto.EmployeeID },
        {
          Token: dto.Token,
        },
      );

      return updater;
    }
  }

  //!--> Send notification
  async sendNotification(employeeId: string, title: string, body: string) {
    const notifyObj = await this.notifyRepository.findOne({
      where: { EmployeeID: employeeId },
    });

    if (notifyObj) {
      const token = notifyObj.Token;

      if (!Expo.isExpoPushToken(token)) {
        console.log('Token is invalid');
        return;
      }

      const messages = [
        {
          to: token,
          sound: 'default',
          title: title,
          body: body,
          data: { withSome: 'data' },
        },
      ];

      const chunks = this.expo.chunkPushNotifications(messages);

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          console.log(ticketChunk);
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  //!--> Create new job
  async creaateJob(dto: JobDto) {
    const job = this.jobRepository.create(dto);
    const response = await this.jobRepository.save(job);

    if (response) {
      return {
        message: 'User role created successfully!',
      };
    }
  }

  //!--> Get jobs by pagination
  async getJobs(dto: FilterDateDto, employeeId: string) {
    const { year, month } = dto;

    const data = await this.jobRepository
      .createQueryBuilder('job')
      .where(
        `YEAR(CONVERT(date, job.CreationDate, 120)) = :year AND MONTH(CONVERT(date, job.CreationDate, 120)) = :month AND job.Technician = :technician`,
        {
          year: Number(year),
          month: Number(month),
          technician: Number(employeeId),
        },
      )
      .getMany();

    return data;
  }

  //!--> Get journeys
  async getJourneys(dto: FilterDateDto, employeeId: string) {
    const { year, month } = dto;

    const data = await this.journeyRepository
      .createQueryBuilder('journey')
      .where(
        `YEAR(CONVERT(date, journey.StartDateTime, 120)) = :year AND MONTH(CONVERT(date, journey.StartDateTime, 120)) = :month AND journey.CreatedBy = :technician`,
        {
          year: Number(year),
          month: Number(month),
          technician: employeeId,
        },
      )
      .getMany();

    return data;
  }

  //!--> Get available journey
  async getAvailableJourney(employeeId: string) {
    const availableJourney = await this.journeyRepository.findOne({
      where: {
        EndDateTime: '',
        CreatedBy: employeeId,
      },
    });

    return availableJourney;
  }

  //!--> Get selected journey
  async getSelectedJourney(journeyId: string) {
    const selectedJourney = await this.journeyRepository.findOne({
      where: {
        JourneyID: journeyId,
      },
    });

    return selectedJourney;
  }

  //!--> give acknowledgement
  async giveAcknowledgement(dto: AcknowledgeJobDto) {
    const sapBody = {
      U_SERApp_CurrentStatus: dto.Acknowledgement,
      U_SERApp_AckDateTime: dto.AcknowledgementDateTime,
    };

    await this.sapService.updateJob(dto.JobID, sapBody);

    const updater = await this.jobRepository.update(
      { JobID: dto.JobID },
      {
        Acknowledgement: dto.Acknowledgement,
        AcknowledgementDateTime: dto.AcknowledgementDateTime,
        AcknowledgementLat: `${dto.AcknowledgementLat}`,
        AcknowledgementLong: `${dto.AcknowledgementLong}`,
        AcknowledgementReason: dto.AcknowledgementReason,
        FinalStatus: dto.FinalStatus,
      },
    );

    if (updater) {
      return updater;
    }
  }

  //!--> create job document
  async createJobDocument(dto: JobDocumentDto) {
    const jobDocument = this.jobDocumentRepository.create(dto);
    const response = await this.jobDocumentRepository.save(jobDocument);

    if (response) {
      return {
        message: 'User role created successfully!',
      };
    }
  }

  //!--> Create Job journey
  async createJobJourney(dto: JobJourneyDto) {
    const JobJourney = this.jobJourneyRepository.create(dto);
    const response = await this.jobJourneyRepository.save(JobJourney);

    if (response) {
      return {
        message: 'User role created successfully!',
      };
    }
  }

  //!--> checkin to client
  async userCheckin(dto: CheckInDto) {
    const sapBody = {
      U_SERApp_CurrentStatus: 'Checked-In',
      U_SERApp_CheckinDateTime: dto.CheckedInDateTime,
    };

    await this.sapService.updateJob(dto.JobID, sapBody);

    const updater = await this.jobRepository.update(
      { JobID: dto.JobID },
      {
        CheckedIn: dto.CheckedIn,
        CheckedInDateTime: dto.CheckedInDateTime,
        CheckedInLat: `${dto.CheckedInLat}`,
        CheckedInLong: `${dto.CheckedInLong}`,
        CheckedInVehicleNumber: dto.CheckedInVehicleNumber,
        CheckedInMeter: dto.CheckedInMeter,
        FinalStatus: dto.FinalStatus,
      },
    );

    if (updater) {
      return updater;
    }
  }

  //!--> Create journey document
  async createJourneyDocument(dto: JourneyDocumentDto) {
    const jobDocument = this.journeyDocumentRepository.create(dto);
    const response = await this.journeyDocumentRepository.save(jobDocument);

    if (response) {
      return {
        message: 'User role created successfully!',
      };
    }
  }

  async getJourneyDocuments(journeyId: string) {
    return await this.journeyDocumentRepository.find({
      where: { JourneyID: journeyId },
    });
  }

  //!--> Create new journey
  async createJourney(dto: JourneyDto, employee: string) {
    dto.StartLat = `${dto.StartLat}`;
    dto.StartLong = `${dto.StartLong}`;

    const jobDocument = this.journeyRepository.create({
      ...dto,
      CreatedBy: employee,
    });
    const response = await this.journeyRepository.save(jobDocument);

    if (response) {
      return {
        message: 'User role created successfully!',
      };
    }
  }

  //!--> Update status
  async updateStatus(dto: StatusUpdateDto) {
    console.log(dto);
    const jobJourneyDocumnent = {
      JourneyID: dto.JourneyID,
      JobID: dto.JobID,
      Status: dto.Status,
      AssignedDate: dto.AssignedDate,
    };

    const jobJourney = await this.createJobJourney(jobJourneyDocumnent);

    if (jobJourney) {
      if (dto.Status === 'Started') {
        const sapBody = {
          U_SERApp_CurrentStatus: 'Inprogress',
          U_SERApp_JobStartDateTime: dto.AssignedDate,
        };

        await this.sapService.updateJob(dto.JobID, sapBody);

        const updater = await this.jobRepository.update(
          { JobID: dto.JobID },
          {
            Status: dto.FinalStatus,
            ActualStartDateTime: dto.AssignedDate,
            FinalStatus: dto.FinalStatus,
          },
        );

        if (updater) {
          return updater;
        }
      } else if (dto.Status === 'Hold') {
        const sapBody = {
          U_SERApp_CurrentStatus: 'Hold',
        };

        await this.sapService.updateJob(dto.JobID, sapBody);

        const updater = await this.jobRepository.update(
          { JobID: dto.JobID },
          {
            Status: dto.FinalStatus,
            HoldStartedDateTime: dto.AssignedDate,
            FinalStatus: dto.FinalStatus,
          },
        );

        if (updater) {
          return updater;
        }
      } else {
        const currentJob = await this.jobRepository.findOne({
          where: { JobID: dto.JobID },
        });

        if (currentJob && currentJob.HoldStartedDateTime !== '') {
          const holdedDate = new Date(currentJob.HoldStartedDateTime);
          const resumedDate = new Date(dto.AssignedDate);

          const differenceInMilliseconds =
            resumedDate.getTime() - holdedDate.getTime();
          const holddifferenceInSeconds = Math.floor(
            differenceInMilliseconds / 1000,
          );

          const holdTimeSec = currentJob.HoldSecCount + holddifferenceInSeconds;

          if (dto.Status === 'Completed') {
            const sapBody = {
              U_SERApp_CurrentStatus: 'Completed',
              U_SERApp_JobEndDateTime: dto.AssignedDate,
              U_SERApp_HoldSeconds: holdTimeSec,
            };

            await this.sapService.updateJob(dto.JobID, sapBody);

            const updater = await this.jobRepository.update(
              { JobID: dto.JobID },
              {
                HoldStartedDateTime: '',
                HoldSecCount: holdTimeSec,
                ActualEndDateTime: dto.AssignedDate,
                Status: dto.FinalStatus,
                FinalStatus: dto.FinalStatus,
              },
            );

            if (updater) {
              return updater;
            }
          } else if (dto.Status === 'Completed and Checkout') {
            const sapBody = {
              U_SERApp_CurrentStatus: 'Checkout',
              U_SERApp_CheckoutDateTime: dto.AssignedDate,
              U_SERApp_JobEndDateTime: dto.AssignedDate,
              U_SERApp_HoldSeconds: holdTimeSec,
            };

            await this.sapService.updateJob(dto.JobID, sapBody);

            const updater = await this.jobRepository.update(
              { JobID: dto.JobID },
              {
                HoldStartedDateTime: '',
                HoldSecCount: holdTimeSec,
                ActualEndDateTime: dto.AssignedDate,
                Status: dto.FinalStatus,
                FinalStatus: 'Completed and Checkout',
                CheckoutDateTime: dto.AssignedDate,
              },
            );

            if (updater) {
              return updater;
            }
          } else if (dto.Status === 'Checkout') {
            const sapBody = {
              U_SERApp_CurrentStatus: 'Checkout',
              U_SERApp_CheckoutDateTime: dto.AssignedDate,
              U_SERApp_HoldSeconds: holdTimeSec,
            };

            await this.sapService.updateJob(dto.JobID, sapBody);

            const updater = await this.jobRepository.update(
              { JobID: dto.JobID },
              {
                HoldStartedDateTime: '',
                HoldSecCount: holdTimeSec,
                Status: dto.FinalStatus,
                FinalStatus: dto.FinalStatus,
                CheckoutDateTime: dto.AssignedDate,
              },
            );

            if (updater) {
              return updater;
            }
          } else {
            const sapBody = {
              U_SERApp_CurrentStatus: 'Inprogress',
              U_SERApp_HoldSeconds: holdTimeSec,
            };

            await this.sapService.updateJob(dto.JobID, sapBody);

            const updater = await this.jobRepository.update(
              { JobID: dto.JobID },
              {
                HoldStartedDateTime: '',
                HoldSecCount: holdTimeSec,
                Status: dto.FinalStatus,
                FinalStatus: dto.FinalStatus,
              },
            );

            if (updater) {
              return updater;
            }
          }
        } else {
          if (dto.Status === 'Completed') {
            const sapBody = {
              U_SERApp_CurrentStatus: 'Completed',
              U_SERApp_JobEndDateTime: dto.AssignedDate,
            };

            await this.sapService.updateJob(dto.JobID, sapBody);

            const updater = await this.jobRepository.update(
              { JobID: dto.JobID },
              {
                ActualEndDateTime: dto.AssignedDate,
                Status: dto.FinalStatus,
                FinalStatus: dto.FinalStatus,
              },
            );

            if (updater) {
              return updater;
            }
          } else if (dto.Status === 'Completed and Checkout') {
            const sapBody = {
              U_SERApp_CurrentStatus: 'Checkout',
              U_SERApp_CheckoutDateTime: dto.AssignedDate,
              U_SERApp_JobEndDateTime: dto.AssignedDate,
            };

            await this.sapService.updateJob(dto.JobID, sapBody);

            const updater = await this.jobRepository.update(
              { JobID: dto.JobID },
              {
                ActualEndDateTime: dto.AssignedDate,
                Status: dto.FinalStatus,
                FinalStatus: 'Completed and Checkout',
                CheckoutDateTime: dto.AssignedDate,
              },
            );

            if (updater) {
              return updater;
            }
          } else {
            const sapBody = {
              U_SERApp_CurrentStatus: 'Checkout',
              U_SERApp_CheckoutDateTime: dto.AssignedDate,
            };

            await this.sapService.updateJob(dto.JobID, sapBody);

            const updater = await this.jobRepository.update(
              { JobID: dto.JobID },
              {
                Status: dto.FinalStatus,
                FinalStatus: dto.FinalStatus,
                CheckoutDateTime: dto.AssignedDate,
              },
            );

            if (updater) {
              return updater;
            }
          }
        }
      }
    }
  }

  //!--> Get today assigned jobs
  async todayAssignedJobs(dto: DateGetterDto, employeeId: string) {
    const jobs = await this.jobRepository.find({
      where: {
        CreationDate: Like(`${dto.filterDate}%`),
        Technician: Number(employeeId),
      },
    });

    return jobs;
  }

  async endJourney(dto: EndJourneyDto) {
    dto.EndLat = `${dto.EndLat}`;
    dto.EndLong = `${dto.EndLong}`;

    const updater = await this.journeyRepository.update(
      { JourneyID: dto.JourneyID },
      {
        EndDateTime: dto.EndDateTime,
        EndVehicleNumber: dto.EndVehicleNumber,
        EndMeter: dto.EndMeter,
        EndLat: dto.EndLat,
        EndLong: dto.EndLong,
      },
    );

    if (updater) {
      return updater;
    }
  }

  //!--> Get inside journey job actions
  async getInsideJourneyJobActions(journeyId: string) {
    return await this.jobJourneyRepository.find({
      where: { JourneyID: journeyId },
    });
  }

  //!--> Updating remarks
  async updateRemark(dto: UpdateRemarkDto) {
    const resolutionObj = await this.sapService.getServiceCallResolution(
      dto.ServiceCall,
    );

    const currentResolution = resolutionObj.value[0].resolution || '-';
    const updatedResolution = currentResolution + dto.NewlyAdded;

    await this.sapService.updateServiceCall(dto.ServiceCall, {
      Resolution: updatedResolution,
    });

    const updater = await this.jobRepository.update(
      { JobID: dto.JobID },
      { Remarks: dto.Remarks },
    );

    if (updater) {
      return updater;
    }
  }

  //!--> Update sample count
  async updateSampleCount(dto: SampleCountDto) {
    const sapBody = {
      U_SMPC: dto.Count,
    };

    await this.sapService.updateJob(dto.JobID, sapBody);

    const updater = await this.jobRepository.update(
      { JobID: dto.JobID },
      {
        Count: dto.Count,
      },
    );

    if (updater) {
      return updater;
    }
  }

  //!--> Get service call scheduling
  async getServiceCallSchedulings() {
    const schedulings = await this.sapService.getServiceCallSchedulings();

    if (schedulings && schedulings.length !== 0) {
      const scheduleMapper = await Promise.all(
        schedulings.map(async (schedule: any) => {
          const plannedStartDate =
            await this.dateGeneratorService.convertSapDate(
              schedule.StartDate,
              schedule.StartTime,
            );

          const plannedEndDate = await this.dateGeneratorService.convertSapDate(
            schedule.EndDate,
            schedule.EndTime,
          );

          let priorityValue = '';

          if (schedule.priority === 'L') {
            priorityValue = 'Low';
          } else if (schedule.priority === 'M') {
            priorityValue = 'Medium';
          } else {
            priorityValue = 'High';
          }

          const job: JobDto = {
            SrcvCallID: schedule.SrcvCallID,
            SrcvCallDocNum: schedule.DocNum,
            Line: schedule.Line,
            JobID: `${schedule.DocNum}-${schedule.Line}`,
            Technician: schedule.Technician,
            CreationDate: plannedStartDate,
            Address: schedule.BPShipAddr || 'Address-(Not Given)',
            Country: schedule.Country || 'Country-(Not Given)',
            City: schedule.City || 'City-(Not Given)',
            Room: schedule.Room || 'Room-(Not Given)',
            StreetNo: schedule.Street || 'Street-(Not Given)',
            Priority: priorityValue,
            Remarks: '',
            Acknowledgement: 'Open',
            AcknowledgementDateTime: '',
            AcknowledgementLat: '',
            AcknowledgementLong: '',
            AcknowledgementReason: '',
            CheckedIn: 'Open',
            CheckedInDateTime: '',
            CheckedInLat: '',
            CheckedInLong: '',
            CheckedInVehicleNumber: '',
            CheckedInMeter: '',
            Status: 'Open',
            PlannedStartDateTime: plannedStartDate,
            PlannedEndDateTime: plannedEndDate,
            ActualStartDateTime: '',
            ActualEndDateTime: '',
            HoldStartedDateTime: '',
            HoldSecCount: 0,
            Subject: schedule.subject,
            BPCode: schedule.customer,
            Customer: schedule.custmrName,
            ContactPerson: `${schedule.contctCode}`,
            ItemCode: schedule.itemCode || 'No item selected',
            ItemDescription: schedule.itemName || 'No item selected',
            ItemGroup: `${schedule.itemGroup}` || 'No item selected',
            SerialNumber: schedule.internalSN || 'No serial number',
            MfrSerial: schedule.manufSN || 'No MFR serial number',
            Count: schedule.U_SMPC || '0',
            FinalStatus: 'Open',
            CheckoutDateTime: '',
          };

          try {
            const jobCreation = await this.creaateJob(job);

            if (jobCreation) {
              await this.sendNotification(
                `${schedule.Technician}`,
                `${schedule.DocNum}-${schedule.Line}`,
                'A new job was assigned to you',
              );

              const sapUpdater = await this.sapService.dataGettingComplete(
                schedule.SrcvCallID,
                schedule.Line,
              );

              if (sapUpdater === '') {
                return `${schedule.SrcvCallID}-${schedule.Line} | Synced`;
              }
            }
          } catch (err) {
            if (err.number === 2627) {
              const sapUpdater = await this.sapService.dataGettingComplete(
                schedule.SrcvCallID,
                schedule.Line,
              );

              if (sapUpdater === '') {
                return `${schedule.SrcvCallID}-${schedule.Line} | Synced`;
              }
            }
          }
        }),
      );

      return scheduleMapper;
    } else {
      return 'Nothing to sync';
    }
  }

  @Cron('*/2 * * * *')
  handleCron() {
    this.getServiceCallSchedulings();
  }

  //!--> Get pagination
  async getAll(dto: FilterWebJobDto, pagination: PaginationModel) {
    if (dto.JobID) {
      dto.JobID = Like(`%${dto.JobID}%`);
    }

    if (dto.Technician && dto.Technician !== '') {
      dto.Technician = Number(dto.Technician);
    }

    const list = await this.jobRepository.find({
      where: dto,
      take: pagination.limit,
      skip: pagination.offset,
      order: { id: 'DESC' },
    });

    return await this.paginationService.pageData(
      list,
      this.jobRepository,
      dto,
      pagination,
    );
  }

  //!--> Get job actions
  async getJobActions(id: string) {
    const actions = await this.jobJourneyRepository.find({
      where: { JobID: id },
    });

    return actions;
  }

  //!--> Get job documents
  async getJobDocuments(id: string) {
    const documents = await this.jobDocumentRepository.find({
      where: { JobID: id },
    });

    return documents;
  }

  //!--> Get Journey pagination
  async getAllJourneys(dto: FilterWebJourneyDto, pagination: PaginationModel) {
    if (dto.JourneyID) {
      dto.JourneyID = Like(`%${dto.JourneyID}%`);
    }

    if (dto.Technician && dto.Technician !== '') {
      dto.Technician = Number(dto.Technician);
    }

    const list = await this.journeyRepository.find({
      where: dto,
      take: pagination.limit,
      skip: pagination.offset,
      order: { id: 'DESC' },
    });

    return await this.paginationService.pageData(
      list,
      this.journeyRepository,
      dto,
      pagination,
    );
  }
}
