import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('expensedocuments')
export class ExpenseDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ExpenseID: string;

  @Column()
  DocumentTarget: string;

  @Column()
  DocumentType: string;

  @Column()
  DocumentPath: string;

  @Column()
  DocumentUrl: string;
}
