import { ScheduleStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ClassDto } from './class.dto';

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsNumber()
  orcamento?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassDto)
  aulas: ClassDto[];
}

export class UpdateScheduleDto extends CreateScheduleDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class DuplicateScheduleDto {
  @IsNotEmpty()
  @IsString()
  scheduleId: string;

  @IsOptional()
  @IsString()
  novoTitulo?: string;
}

export class ChangeScheduleStatusDto {
  @IsNotEmpty()
  @IsString()
  scheduleId: string;

  @IsNotEmpty()
  @IsEnum(ScheduleStatus)
  novoStatus: ScheduleStatus;

  @IsOptional()
  @IsString()
  nota?: string;

  @IsOptional()
  @IsString()
  dataAtivacao?: string;
}

export class GetSchedulesDto {
  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;
}
