import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  employId: string;

  @Column()
  gender: string;

  @Column()
  email: string;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  description: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column()
  password: string;

  @Column()
  otp: string;

  @Column()
  otpExpired: boolean;

  @Column({ default: true })
  status: boolean;
}
