import { IsOptional, IsDateString } from 'class-validator';

export class GetClassesDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}
