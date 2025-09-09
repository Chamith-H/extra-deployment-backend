import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('jobdocuments')
export class JobDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  JobID: string;

  @Column()
  DocumentTarget: string;

  @Column()
  DocumentType: string;

  @Column({ nullable: true })
  DocumentPath: string;

  @Column({ nullable: true })
  DocumentUrl: string;
}
