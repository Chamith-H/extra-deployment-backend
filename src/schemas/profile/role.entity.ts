import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Access } from './permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  description: string;

  @Column({ default: true })
  status: boolean;

  @ManyToMany(() => Access, { eager: true })
  @JoinTable({
    name: 'role_access',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'access_id',
      referencedColumnName: 'id',
    },
  })
  accesses: Access[];
}
