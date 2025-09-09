import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('errorlog')
export class ErrorLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  target: string;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  error: string;

  @Column({ type: 'nvarchar', length: 4000, nullable: true })
  body: string;

  @CreateDateColumn({ type: 'datetime' })
  date: Date;
}
