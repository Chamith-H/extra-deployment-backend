import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/schemas/profile/role.entity';
import { Like, Repository } from 'typeorm';
import { RoleDto } from './dto/role.dto';
import { FilterRoleDto } from './dto/filter-role.dto';
import { PaginationModel } from 'src/configs/interfaces/pagination.model';
import { PaginationService } from 'src/shared/table-paginator.service';
import { AddPermissionDto } from './dto/add-permission.dto';
import { Access } from 'src/schemas/profile/permission.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Access)
    private readonly accessRepository: Repository<Access>,

    private readonly paginationService: PaginationService,
  ) {}

  //!--> Create
  async create(dto: RoleDto) {
    const roleDoc = {
      ...dto,
      accesses: [],
    };

    const role = this.roleRepository.create(roleDoc);
    const response = await this.roleRepository.save(role);

    if (response) {
      return {
        message: 'User role created successfully!',
      };
    }
  }

  //!--> Get pagination
  async getAll(dto: FilterRoleDto, pagination: PaginationModel) {
    if (dto.name) {
      dto.name = Like(`%${dto.name}%`);
    }

    const list = await this.roleRepository.find({
      where: dto,
      take: pagination.limit,
      skip: pagination.offset,
      order: { id: 'DESC' },
    });

    return await this.paginationService.pageData(
      list,
      this.roleRepository,
      dto,
      pagination,
    );
  }

  //!--> get roles for dropdown
  async getDropdown() {
    return await this.roleRepository.find({
      where: { status: true },
    });
  }

  //!--> Get roles for permission
  async getPermissionRoles() {
    const permissionedRoles = await this.roleRepository.find({
      relations: ['accesses'],
    });

    return permissionedRoles;
  }

  //!--> Add permission to role
  async addPermission(dto: AddPermissionDto) {
    const role = await this.roleRepository.findOne({
      where: { id: dto.role },
      relations: ['accesses'], // optional
    });

    if (!role) {
      throw new Error('Role not found');
    }

    const accessEntities = await this.accessRepository.findByIds(dto.accesses);

    role.accesses = accessEntities;

    const updatedRole = await this.roleRepository.save(role);

    if (updatedRole) {
      return {
        message: 'Permissions updated successfully!',
      };
    }
  }
}
