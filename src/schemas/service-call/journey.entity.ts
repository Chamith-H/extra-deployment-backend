import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('journeys')
export class Journey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  JourneyID: string;

  @Column()
  Technician: number;

  @Column()
  JourneyDate: string;

  @Column()
  StartDateTime: string;

  @Column()
  StartVehicleNumber: string;

  @Column()
  VehicleType: string;

  @Column()
  StartMeter: string;

  @Column()
  StartLat: string;

  @Column()
  StartLong: string;

  @Column()
  EndDateTime: string;

  @Column()
  EndVehicleNumber: string;

  @Column()
  EndMeter: string;

  @Column()
  EndLat: string;

  @Column()
  EndLong: string;

  @Column()
  CreatedBy: string;
}
