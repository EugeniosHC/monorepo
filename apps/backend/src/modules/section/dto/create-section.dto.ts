import { IsObject, IsOptional, IsString, Length } from 'class-validator';
import { SectionType } from '@prisma/client';

export class CreateSectionDto {
  @IsString()
  @Length(1, 30)
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  type: SectionType;

  @IsObject()
  data: JSON;
}
