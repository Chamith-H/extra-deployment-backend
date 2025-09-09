import { IsNotEmpty } from 'class-validator';

export class UserActionDto {
  @IsNotEmpty()
  employId: string;
}
