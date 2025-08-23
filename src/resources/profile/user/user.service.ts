import { BadRequestException, Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/schemas/profile/user.entity';
import { Like, Repository } from 'typeorm';
import { PaginationService } from 'src/shared/table-paginator.service';
import { PaginationModel } from 'src/configs/interfaces/pagination.model';
import { FilterUserDto } from './dto/filter-user.dto';
import * as generator from 'generate-password';
import * as argon from 'argon2';
import { register_userPassword } from 'src/configs/templates/email.template';
import * as cheerio from 'cheerio';
import { EmailSenderService } from 'src/shared/email-sender.service';
import { EmailModel } from 'src/configs/interfaces/email.model';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly paginationService: PaginationService,
    private readonly emailSenderService: EmailSenderService,
  ) {}

  //!--> Create
  async create(dto: UserDto) {
    const password = await generator.generate({
      length: 8,
      numbers: true,
    });

    const encryptedPassword = await argon.hash(password);

    const templateString = register_userPassword(
      dto.name,
      dto.employId,
      password,
    );

    const $ = cheerio.load(templateString);
    const modifiedHtml = $.html();

    const emailData: EmailModel = {
      receiver: dto.email,
      heading: 'User account creation',
      template: modifiedHtml,
    };

    const mailStatus = await this.emailSenderService.sendEmail(emailData);

    if (!mailStatus) {
      throw new BadRequestException(
        'Sorry, password cannot be sent to this office email!',
      );
    }

    const userDoc = {
      ...dto,
      status: true,
      password: encryptedPassword,
      otp: '000000',
      otpExpired: true,
    };
    const role = this.userRepository.create(userDoc);
    const response = await this.userRepository.save(role);

    if (response) {
      return {
        message: 'User created successfully!',
      };
    }
  }

  //!--> Update
  async update(id: string, dto: UserDto) {
    const updater = await this.userRepository.update(
      { id: Number(id) },
      {
        ...dto,
      },
    );
    if (updater) {
      return {
        message: 'User updated successfully!',
      };
    }
  }

  //!--> Get pagination
  async getAll(dto: FilterUserDto, pagination: PaginationModel) {
    if (dto.name) {
      dto.name = Like(`%${dto.name}%`);
    }

    const list = await this.userRepository.find({
      where: dto,
      relations: ['role'],
      take: pagination.limit,
      skip: pagination.offset,
      order: { id: 'DESC' },
    });

    return await this.paginationService.pageData(
      list,
      this.userRepository,
      dto,
      pagination,
    );
  }

  //!--> Get single user
  async getSingleUser(id: string) {
    const userData = await this.userRepository.findOne({
      where: { employId: id },
      relations: ['role'],
    });

    return userData;
  }

  //!--> Get all users
  async getAllUsers() {
    return this.userRepository.find({
      select: ['name', 'employId'],
    });
  }
}
