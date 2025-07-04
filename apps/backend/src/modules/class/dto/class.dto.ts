import { ClassCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ClassDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsNotEmpty()
  @IsEnum(ClassCategory)
  categoria: ClassCategory;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana: number;

  @IsNotEmpty()
  @IsString()
  horaInicio: string;

  @IsNotEmpty()
  @IsInt()
  @Min(15)
  duracao: number;

  @IsNotEmpty()
  @IsString()
  sala: string;

  @IsNotEmpty()
  @IsString()
  professor: string;

  @IsNotEmpty()
  @IsString()
  intensidade: string;

  @IsOptional()
  @IsNumber()
  custo?: number;
}
