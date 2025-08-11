import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErpSession } from 'src/schemas/common/erp-session.entity';
import { Repository } from 'typeorm';
import { DbSessionDto } from './dto/db-session.dto';
import axios from 'axios';
import * as https from 'https';

@Injectable()
export class ErpService {
  constructor(
    @InjectRepository(ErpSession)
    private readonly erpRepository: Repository<ErpSession>,
  ) {}

  //!--> Add new session to DB
  async createErpSessionOnDB(dto: DbSessionDto) {
    const dbSession = this.erpRepository.create(dto);
    const response = await this.erpRepository.save(dbSession);

    if (response) {
      return {
        message: 'DB session created successfully!',
      };
    }
  }

  //!--> login to ERP (SAP)
  async loginToErp() {
    const serviceLayerCredentials = {
      CompanyDB: process.env.SAP_DB,
      UserName: process.env.SAP_USER,
      Password: process.env.SAP_PWD,
    };

    try {
      const session = await axios.post(
        process.env.SAP_HOST + '/Login',
        serviceLayerCredentials,
        {
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        },
      );

      return {
        session: session.data.SessionId,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  //!--> Request session token
  async requestSession() {
    const connection = await this.erpRepository.findOne({
      where: { target: 'ERP' },
    });

    const exist_sessionDate = new Date(connection.date);
    const current_sessionDate = new Date();

    const timeGap = current_sessionDate.getTime() - exist_sessionDate.getTime();
    const difference = timeGap / (1000 * 60);

    if (difference > 26) {
      const sapConnection = await this.loginToErp();

      const updateSession = await this.erpRepository.update(
        { target: 'ERP' },
        {
          sessionToken: sapConnection.session,
          date: new Date(),
        },
      );

      if (updateSession) {
        return sapConnection.session;
      }
    } else {
      return connection.sessionToken;
    }
  }
}
