import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ExpenseID: string;

  @Column()
  JobID: string;

  @Column()
  JourneyID: string;

  @Column()
  Type: string;

  @Column()
  Amount: string;

  @Column()
  Description: string;

  @Column()
  CreatedDate: string;

  @Column()
  CreatedBy: string;

  @Column({ default: 'Pending', nullable: true })
  Status?: string;
}
