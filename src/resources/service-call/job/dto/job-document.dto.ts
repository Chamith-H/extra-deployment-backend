import { IsNotEmpty } from 'class-validator';

export class JobDocumentDto {
  @IsNotEmpty()
  JobID: string;

  @IsNotEmpty()
  DocumentTarget: string;

  @IsNotEmpty()
  DocumentType: string;

  @IsNotEmpty()
  DocumentPath: string;

  @IsNotEmpty()
  DocumentUrl: string;
}
