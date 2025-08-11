import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Jobs')
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  SrcvCallID: number;

  @Column()
  SrcvCallDocNum: number;

  @Column()
  Line: number;

  @Column({ unique: true })
  JobID: string;

  @Column()
  Technician: number;

  @Column()
  CreationDate: string;

  @Column({ nullable: true })
  Address: string;

  @Column({ nullable: true })
  Country: string;

  @Column({ nullable: true })
  City: string;

  @Column({ nullable: true })
  Room: string;

  @Column({ nullable: true })
  StreetNo: string;

  @Column({ nullable: true })
  Priority: string;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  Remarks: string;

  @Column({ nullable: true })
  Acknowledgement: string;

  @Column({ nullable: true })
  AcknowledgementDateTime: string;

  @Column({ nullable: true })
  AcknowledgementLat: string;

  @Column({ nullable: true })
  AcknowledgementLong: string;

  @Column({ nullable: true })
  AcknowledgementReason: string;

  @Column({ nullable: true })
  CheckedIn: string;

  @Column({ nullable: true })
  CheckedInDateTime: string;

  @Column({ nullable: true })
  CheckedInLat: string;

  @Column({ nullable: true })
  CheckedInLong: string;

  @Column({ nullable: true })
  CheckedInVehicleNumber: string;

  @Column({ nullable: true })
  CheckedInMeter: string;

  @Column({ nullable: true })
  Status: string;

  @Column({ nullable: true })
  PlannedStartDateTime: string;

  @Column({ nullable: true })
  PlannedEndDateTime: string;

  @Column({ nullable: true })
  ActualStartDateTime: string;

  @Column({ nullable: true })
  ActualEndDateTime: string;

  @Column({ nullable: true })
  HoldStartedDateTime: string;

  @Column({ default: 0 })
  HoldSecCount: number;

  @Column({ nullable: true })
  Subject: string;

  @Column({ nullable: true })
  BPCode: string;

  @Column({ nullable: true })
  Customer: string;

  @Column({ nullable: true })
  ContactPerson: string;

  @Column({ nullable: true })
  ItemCode: string;

  @Column({ nullable: true })
  ItemDescription: string;

  @Column({ nullable: true })
  ItemGroup: string;

  @Column({ nullable: true })
  SerialNumber: string;

  @Column({ nullable: true })
  MfrSerial: string;

  @Column({ nullable: true })
  Count: string;

  @Column({ nullable: true })
  FinalStatus: string;

  @Column({ nullable: true })
  CheckoutDateTime: string;
}
