import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Access } from 'src/schemas/profile/permission.entity';
import { Repository } from 'typeorm';
import { PermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Access)
    private readonly accessRepository: Repository<Access>,
  ) {}

  //!--> Create permission
  async createPermission(dto: PermissionDto) {
    const permissionDoc = {
      ...dto,
    };
    const permission = this.accessRepository.create(permissionDoc);
    const response = await this.accessRepository.save(permission);

    if (response) {
      return {
        message: 'User role created successfully!',
      };
    }
  }

  //!--> Get all permissions
  async getPermissions() {
    const permissions = await this.accessRepository.find({});

    const structuresArray = [];

    for (const perm of permissions) {
      // Find the module
      let moduleEntry = structuresArray.find((m) => m.module === perm.module);
      if (!moduleEntry) {
        moduleEntry = {
          module: perm.module,
          sections: [],
        };
        structuresArray.push(moduleEntry);
      }

      // Find the section inside the module
      let sectionEntry = moduleEntry.sections.find(
        (s) => s.name === perm.section,
      );
      if (!sectionEntry) {
        sectionEntry = {
          name: perm.section,
          permissions: [],
        };
        moduleEntry.sections.push(sectionEntry);
      }

      // Add permission to section
      sectionEntry.permissions.push({
        name: perm.name,
        checker: perm.checker,
        id: perm.id,
      });
    }

    return structuresArray;
  }
}
