import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('jobjourneys')
export class JobJourney {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  JourneyID: string;

  @Column()
  JobID: string;

  @Column()
  Status: string;

  @Column()
  AssignedDate: string;
}
