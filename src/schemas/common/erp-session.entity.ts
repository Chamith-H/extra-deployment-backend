import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('erp_session')
export class ErpSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'nvarchar', length: 10 })
  target: string;

  @Column({ type: 'nvarchar', length: 1000 })
  sessionToken: string;

  @CreateDateColumn({ type: 'datetime' })
  date: Date;
}
