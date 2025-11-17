import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'src/schemas/service-call/job.entity';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
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
import { User } from 'src/schemas/profile/user.entity';
import { SparePart } from 'src/schemas/service-call/spare-part.entity';
import { SparePartLine } from 'src/schemas/service-call/spare-prt-line.entity';
import { SparePartDto } from './dto/spare-part.dto';
import { FilterServiceDto } from './dto/filter-service.dto';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

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

    @InjectRepository(SparePart)
    private readonly sparePartRepository: Repository<SparePart>,

    @InjectRepository(SparePartLine)
    private readonly sparePartLineRepository: Repository<SparePartLine>,

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

  //!--> Get non completed jobs
  async getNonCompletedJobs(employeeId: string) {
    return this.jobRepository.find({
      where: {
        Technician: Number(employeeId),
        FinalStatus: Not('Completed and Checkout'),
      },
    });
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

  //!--> Get business partners
  async get_businessPartners(employId: number) {
    const partners = await this.jobRepository
      .createQueryBuilder('job')
      .select('job.BPCode', 'value')
      .addSelect('MIN(job.Customer)', 'label')
      .where('job.BPCode IS NOT NULL')
      .andWhere('job.Technician = :employId', { employId })
      .andWhere('job.FinalStatus = :statusF', {
        statusF: 'Completed and Checkout',
      })
      .groupBy('job.BPCode')
      .getRawMany();

    return partners;
  }

  //!--> Get jobs by pagination
  async getHistory(dto: FilterServiceDto, employeeId: string) {
    const { year, month, bp } = dto;

    const data = await this.jobRepository
      .createQueryBuilder('job')
      .where(
        `YEAR(CONVERT(date, job.CreationDate, 120)) = :year AND MONTH(CONVERT(date, job.CreationDate, 120)) = :month AND job.Technician = :technician AND job.BPCode = :bpCode`,
        {
          year: Number(year),
          month: Number(month),
          technician: Number(employeeId),
          bpCode: bp,
        },
      )
      .getMany();

    return data;
  }

  @Cron('*/2 * * * *')
  handleCron() {
    this.getServiceCallSchedulings();
  }

  //!--> Get pagination
  async getAll(dto: FilterWebJobDto, pagination: PaginationModel) {
    const query = this.jobRepository
      .createQueryBuilder('job')
      .addSelect([
        'job.JobID AS JobID',
        'job.Priority AS Priority',
        'job.FinalStatus AS FinalStatus',
        'job.PlannedStartDateTime AS PlannedStartDateTime',
        'job.PlannedEndDateTime AS PlannedEndDateTime',
        'job.ActualStartDateTime AS ActualStartDateTime',
        'job.ActualEndDateTime AS ActualEndDateTime',
        'job.Acknowledgement AS Acknowledgement',
        'job.AcknowledgementDateTime AS AcknowledgementDateTime',
        'job.AcknowledgementLat AS AcknowledgementLat',
        'job.AcknowledgementLong AS AcknowledgementLong',
        'job.AcknowledgementReason AS AcknowledgementReason',
        'job.CheckedIn AS CheckedIn',
        'job.CheckedInDateTime AS CheckedInDateTime',
        'job.CheckedInLat AS CheckedInLat',
        'job.CheckedInLong AS CheckedInLong',
        'job.CheckedInMeter AS CheckedInMeter',
        'job.CheckedInVehicleNumber AS CheckedInVehicleNumber',
        'job.CheckoutDateTime AS CheckoutDateTime',
        'job.Address AS Address',
        'job.BPCode AS BPCode',
        'job.City AS City',
        'job.ContactPerson AS ContactPerson',
        'job.Count AS Count',
        'job.Country AS Country',
        'job.CreationDate AS CreationDate',
        'job.Customer AS Customer',
        'job.HoldSecCount AS HoldSecCount',
        'job.HoldStartedDateTime AS HoldStartedDateTime',
        'job.ItemCode AS ItemCode',
        'job.ItemDescription AS ItemDescription',
        'job.ItemGroup AS ItemGroup',
        'job.Line AS Line',
        'job.MfrSerial AS MfrSerial',
        'job.Remarks AS Remarks',
        'job.Room AS Room',
        'job.SerialNumber AS SerialNumber',
        'job.SrcvCallDocNum AS SrcvCallDocNum',
        'job.SrcvCallID AS SrcvCallID',
        'job.Status AS Status',
        'job.StreetNo AS StreetNo',
        'job.Subject AS Subject',
        'job.Technician AS Technician',
        'job.id AS id',
      ]);

    // ✅ Apply filters properly
    if (dto.jobId) {
      query.andWhere('job.JobID LIKE :jobId', { jobId: `%${dto.jobId}%` });
    }
    if (dto.technician) {
      const users = await this.userRepository.find({
        where: [
          { employId: Like(`%${dto.technician}%`) },
          { name: Like(`%${dto.technician}%`) },
        ],
      });

      console.log(users);

      if (users && users.length !== 0) {
        const userIds = users.map((usr: any) => {
          return Number(usr.employId);
        });

        query.andWhere('job.Technician IN (:...userIds)', { userIds });
      }
    }
    if (dto.priority) {
      query.andWhere('job.Priority LIKE :priority', {
        priority: `%${dto.priority}%`,
      });
    }
    if (dto.finalStatus) {
      query.andWhere('job.FinalStatus LIKE :finalStatus', {
        finalStatus: `%${dto.finalStatus}%`,
      });
    }
    if (dto.startDate && dto.endDate) {
      query.andWhere('job.PlannedStartDateTime >= :start', {
        start: `${dto.startDate}T00:00:00`,
      });
      query.andWhere('job.PlannedEndDateTime <= :end', {
        end: `${dto.endDate}T23:59:59`,
      });
    } else if (dto.startDate) {
      query.andWhere('job.PlannedStartDateTime BETWEEN :start AND :end', {
        start: `${dto.startDate}T00:00:00`,
        end: `${dto.startDate}T23:59:59`,
      });
    } else if (dto.endDate) {
      query.andWhere('job.PlannedEndDateTime BETWEEN :start AND :end', {
        start: `${dto.endDate}T00:00:00`,
        end: `${dto.endDate}T23:59:59`,
      });
    }

    // ✅ Sorting (your same logic)
    if (dto.action === 'ASC_ID') {
      query.orderBy('job.id', 'ASC');
    } else if (dto.action === 'DESC_ID') {
      query.orderBy('job.id', 'DESC');
    } else if (dto.action === 'ASC_JobID') {
      query.orderBy('job.JobID', 'ASC');
    } else if (dto.action === 'DESC_JobID') {
      query.orderBy('job.JobID', 'DESC');
    } else {
      query.orderBy('job.id', 'DESC');
    }

    // ✅ Pagination (now works)
    query.take(pagination.limit).skip(pagination.offset);

    let [list, count] = await query.getManyAndCount();

    const allUsers = await this.userRepository.find();

    if (list && list.length !== 0) {
      const listMapper = list.map((lst: any) => {
        const technician = `${lst.Technician}`;

        const user = allUsers.find((usr: any) => usr.employId === technician);
        lst.technicianName = user?.name;
        return lst;
      });

      if (listMapper) {
        list = listMapper;
      }
    }

    return {
      data: list,
      totalCount: count,
      pageCount: Math.ceil(count / pagination.limit),
      page: pagination.page,
    };
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
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const offset = (page - 1) * limit;

    const qb = this.journeyRepository
      .createQueryBuilder('journey')
      .addSelect([
        'journey.id AS id',
        'journey.JourneyID AS JourneyID',
        'journey.Technician AS Technician',
        'journey.JourneyDate AS JourneyDate',
        'journey.StartDateTime AS StartDateTime',
        'journey.StartVehicleNumber AS StartVehicleNumber',
        'journey.VehicleType AS VehicleType',
        'journey.StartMeter AS StartMeter',
        'journey.StartLat AS StartLat',
        'journey.StartLong AS StartLong',
        'journey.EndDateTime AS EndDateTime',
        'journey.EndVehicleNumber AS EndVehicleNumber',
        'journey.EndMeter AS EndMeter',
        'journey.EndLat AS EndLat',
        'journey.EndLong AS EndLong',
        'journey.CreatedBy AS CreatedBy',
      ]);

    // filters (same as before) ...
    if (dto.journeyID) {
      qb.andWhere('journey.JourneyID LIKE :jid', { jid: `%${dto.journeyID}%` });
    }
    if (dto.technician) {
      const users = await this.userRepository.find({
        where: [
          { employId: Like(`%${dto.technician}%`) },
          { name: Like(`%${dto.technician}%`) },
        ],
      });

      if (users && users.length !== 0) {
        const userIds = users.map((usr: any) => {
          return Number(usr.employId);
        });

        qb.andWhere('journey.Technician IN (:...userIds)', { userIds });
      }
    }
    if (dto.vehicleType) {
      qb.andWhere('journey.VehicleType LIKE :vt', {
        vt: `%${dto.vehicleType}%`,
      });
    }
    if (dto.vahicleNumber) {
      qb.andWhere(
        '(journey.StartVehicleNumber LIKE :vn OR journey.EndVehicleNumber LIKE :vn)',
        { vn: `%${dto.vahicleNumber}%` },
      );
    }
    if (dto.status === 'Ongoing') {
      qb.andWhere("(journey.EndDateTime IS NULL OR journey.EndDateTime = '')");
    } else if (dto.status) {
      qb.andWhere(
        "(journey.EndDateTime IS NOT NULL AND journey.EndDateTime <> '')",
      );
    }

    // date filters
    if (dto.startDate && dto.endDate) {
      qb.andWhere('journey.StartDateTime >= :start', {
        start: `${dto.startDate}T00:00:00`,
      }).andWhere('journey.EndDateTime <= :end', {
        end: `${dto.endDate}T23:59:59`,
      });
    } else if (dto.startDate) {
      qb.andWhere('journey.StartDateTime BETWEEN :s1 AND :s2', {
        s1: `${dto.startDate}T00:00:00`,
        s2: `${dto.startDate}T23:59:59`,
      });
    } else if (dto.endDate) {
      qb.andWhere('journey.EndDateTime BETWEEN :e1 AND :e2', {
        e1: `${dto.endDate}T00:00:00`,
        e2: `${dto.endDate}T23:59:59`,
      });
    }

    // sorting
    switch (dto.action) {
      case 'ASC_ID':
        qb.orderBy('journey.id', 'ASC');
        break;
      case 'DESC_ID':
        qb.orderBy('journey.id', 'DESC');
        break;
      case 'ASC_JourneyID':
        qb.orderBy('journey.JourneyID', 'ASC');
        break;
      case 'DESC_JourneyID':
        qb.orderBy('journey.JourneyID', 'DESC');
        break;
      case 'ASC_SDate':
        qb.orderBy('journey.StartDateTime', 'ASC');
        break;
      case 'DESC_SDate':
        qb.orderBy('journey.StartDateTime', 'DESC');
        break;
      case 'ASC_EDate':
        qb.orderBy('journey.EndDateTime', 'ASC');
        break;
      case 'DESC_EDate':
        qb.orderBy('journey.EndDateTime', 'DESC');
        break;
      default:
        qb.orderBy('journey.id', 'DESC');
    }

    // ✅ pagination
    qb.skip(offset).take(limit);

    // use raw results to get alias fields
    let [list, total] = await qb.getManyAndCount();

    const allUsers = await this.userRepository.find();

    if (list && list.length !== 0) {
      const listMapper = list.map((lst: any) => {
        const technician = `${lst.Technician}`;

        const user = allUsers.find((usr: any) => usr.employId === technician);
        lst.technicianName = user?.name;
        return lst;
      });

      if (listMapper) {
        list = listMapper;
      }
    }

    return {
      data: list,
      totalCount: total,
      pageCount: Math.ceil(total / limit),
      page,
    };
  }

  //!--> Create sparepart
  async createSparePartReuest(dto: SparePartDto, employee: number) {
    const lineMapper = await Promise.all(
      dto.lines.map(async (dLine: any) => {
        const sparePartLine = {
          RequestId: dto.RequestId,
          ItemCode: dLine.ItemCode,
          ItemName: dLine.ItemName,
          Quantity: dLine.Quantity,
          Consume: '',
        };

        const spareLine = this.sparePartLineRepository.create(sparePartLine);
        const response = await this.sparePartLineRepository.save(spareLine);

        if (response) {
          return {
            response,
          };
        }
      }),
    );

    if (lineMapper) {
      const partRequest = {
        JobID: dto.JobID,
        Technician: employee,
        CreatedDate: dto.CreatedDate,
        RequestId: dto.RequestId,
        ErpCode: '',
        Warehouse: dto.Warehouse,
        Status: 'Open',
      };

      const spareHead = this.sparePartRepository.create(partRequest);
      const response = await this.sparePartRepository.save(spareHead);

      if (response) {
        return {
          message: 'Spare part request created successfully!',
        };
      }
    }
  }

  //!--> Get spare part requests
  async getSparePartRequests(jobId: string, employId: number) {
    const spareParts = await this.sparePartRepository.find({
      where: { Technician: employId, JobID: jobId },
    });

    if (spareParts && spareParts.length === 0) {
      return [];
    } else {
      const sparePartMapper = await Promise.all(
        spareParts.map(async (sPart: any) => {
          const sparePartRows = await this.sparePartLineRepository.find({
            where: { RequestId: sPart.RequestId },
          });

          const parts = {
            ...sPart,
            lines: sparePartRows,
          };

          return parts;
        }),
      );

      return sparePartMapper;
    }
  }

  //!--> Update consumeValues
  async updateConsumeValues(itemArr: any[]) {
    const consumeMapper = await Promise.all(
      itemArr.map(async (iArr: any) => {
        const updater = await this.sparePartLineRepository.update(
          { id: iArr.id },
          { Consume: iArr.Consume },
        );

        return updater;
      }),
    );

    if (consumeMapper) {
      return { message: 'Consumed quantity updated successfully!' };
    }
  }
}
