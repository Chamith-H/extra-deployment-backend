import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('journeydocuments')
export class JourneyDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  JourneyID: string;

  @Column()
  DocumentType: string;

  @Column({ nullable: true })
  DocumentPath: string;

  @Column({ nullable: true })
  DocumentUrl: string;
}
