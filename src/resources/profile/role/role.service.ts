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
import { User } from 'src/schemas/profile/user.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

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

  //!--> Update
  async update(id: string, dto: RoleDto) {
    const updater = await this.roleRepository.update(
      { id: Number(id) },
      {
        ...dto,
      },
    );
    if (updater) {
      return {
        message: 'User role updated successfully!',
      };
    }
  }

  //!--> Get pagination
  async getAll(dto: FilterRoleDto, pagination: PaginationModel) {
    if (dto.name) {
      dto.name = Like(`%${dto.name}%`);
    }

    let soter: any = null;

    if (dto.action === 'ASC_ID') {
      soter = { id: 'ASC' };
    } else if (dto.action === 'DESC_ID') {
      soter = { id: 'DESC' };
    } else if (dto.action === 'ASC_RoleName') {
      soter = { name: 'ASC' };
    } else if (dto.action === 'DESC_RoleName') {
      soter = { name: 'DESC' };
    }

    delete dto.action;

    const list = await this.roleRepository.find({
      where: dto,
      take: pagination.limit,
      skip: pagination.offset,
      order: soter,
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

    console.log(role);

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

  //!--> Delete role
  async deleteRole(id: string) {
    const hasUser = await this.userRepository.findOne({
      where: {
        role: { id: Number(id) },
      },
      relations: ['role'],
    });

    if (hasUser) {
      throw new BadRequestException(
        'Cannot delete, This user role has been assigned to some users!',
      );
    }

    const deleter = await this.roleRepository.delete(Number(id));

    if (deleter) {
      return {
        message: 'User role deleted successfully!',
      };
    }
  }
}
