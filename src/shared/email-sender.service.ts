import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailModel } from 'src/configs/interfaces/email.model';

@Injectable()
export class EmailSenderService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PSWD,
      },
    });
  }

  async sendEmail(bodyData: EmailModel) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: bodyData.receiver,
      subject: bodyData.heading,
      html: bodyData.template,
    };

    try {
      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error occurred:', error);
      return false;
    }
  }
}
