import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class JobDto {
  @IsNumber()
  SrcvCallID: number;

  @IsNumber()
  SrcvCallDocNum: number;

  @IsNumber()
  Line: number;

  @IsString()
  JobID: string;

  @IsNumber()
  Technician: number;

  @IsDateString()
  CreationDate: string;

  @IsOptional()
  @IsString()
  Address: string;

  @IsOptional()
  @IsString()
  Country: string;

  @IsOptional()
  @IsString()
  City: string;

  @IsOptional()
  @IsString()
  Room: string;

  @IsOptional()
  @IsString()
  StreetNo: string;

  @IsOptional()
  @IsString()
  Priority: string;

  @IsOptional()
  @IsString()
  Remarks: string;

  @IsOptional()
  @IsString()
  Acknowledgement: string;

  @IsOptional()
  @IsDateString()
  AcknowledgementDateTime: string;

  @IsOptional()
  @IsString()
  AcknowledgementLat: string;

  @IsOptional()
  @IsString()
  AcknowledgementLong: string;

  @IsOptional()
  @IsString()
  AcknowledgementReason: string;

  @IsOptional()
  @IsString()
  CheckedIn: string;

  @IsOptional()
  @IsDateString()
  CheckedInDateTime: string;

  @IsOptional()
  @IsString()
  CheckedInLat: string;

  @IsOptional()
  @IsString()
  CheckedInLong: string;

  @IsOptional()
  @IsString()
  CheckedInVehicleNumber: string;

  @IsOptional()
  @IsString()
  CheckedInMeter: string;

  @IsOptional()
  @IsString()
  Status: string;

  @IsOptional()
  @IsDateString()
  PlannedStartDateTime: string;

  @IsOptional()
  @IsDateString()
  PlannedEndDateTime: string;

  @IsOptional()
  @IsDateString()
  ActualStartDateTime: string;

  @IsOptional()
  @IsDateString()
  ActualEndDateTime: string;

  @IsOptional()
  @IsDateString()
  HoldStartedDateTime: string;

  @IsOptional()
  @IsNumber()
  HoldSecCount: number;

  @IsOptional()
  @IsString()
  Subject: string;

  @IsOptional()
  @IsString()
  BPCode: string;

  @IsOptional()
  @IsString()
  Customer: string;

  @IsOptional()
  @IsString()
  ContactPerson: string;

  @IsOptional()
  @IsString()
  ItemCode: string;

  @IsOptional()
  @IsString()
  ItemDescription: string;

  @IsOptional()
  @IsString()
  ItemGroup: string;

  @IsOptional()
  @IsString()
  SerialNumber: string;

  @IsOptional()
  @IsString()
  MfrSerial: string;

  @IsOptional()
  Count: string;

  @IsOptional()
  FinalStatus: string;

  @IsOptional()
  CheckoutDateTime: string;
}
