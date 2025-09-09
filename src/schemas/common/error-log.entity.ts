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

  @Column()
  user: string;

  @Column()
  category: string;

  @Column()
  type: string;

  @Column()
  target: string;

  @Column({ type: 'nvarchar', length: 1000 })
  error: string;

  @Column({ type: 'nvarchar', length: 4000 })
  body: string;

  @CreateDateColumn({ type: 'datetime' })
  date: Date;
}
