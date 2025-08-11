import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('journeydocuments')
export class JourneyDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  JourneyID: string;

  @Column()
  DocumentType: string;

  @Column()
  DocumentPath: string;

  @Column()
  DocumentUrl: string;
}
