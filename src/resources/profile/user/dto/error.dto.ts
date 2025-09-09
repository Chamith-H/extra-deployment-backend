import { IsOptional } from 'class-validator';

export class ErrorDto {
  @IsOptional()
  user: string;

  @IsOptional()
  category: string;

  @IsOptional()
  type: string;

  @IsOptional()
  target: string;

  @IsOptional()
  error: string;

  @IsOptional()
  body: string;
}
