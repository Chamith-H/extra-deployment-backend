import { IsNotEmpty } from 'class-validator';

export class ExpenseDocumentDto {
  @IsNotEmpty()
  ExpenseID: string;

  @IsNotEmpty()
  DocumentTarget: string;

  @IsNotEmpty()
  DocumentType: string;

  @IsNotEmpty()
  DocumentPath: string;

  @IsNotEmpty()
  DocumentUrl: string;
}
