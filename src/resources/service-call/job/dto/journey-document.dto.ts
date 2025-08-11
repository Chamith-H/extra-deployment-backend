import { IsNotEmpty } from 'class-validator';

export class JourneyDocumentDto {
  @IsNotEmpty()
  JourneyID: string;

  @IsNotEmpty()
  DocumentType: string;

  @IsNotEmpty()
  DocumentPath: string;

  @IsNotEmpty()
  DocumentUrl: string;
}
