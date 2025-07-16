import {
  IsObject,
  IsOptional,
  IsString,
  Length,
  IsBoolean,
} from 'class-validator';
import { SectionType } from '@prisma/client';

export class UpdateSectionDto {
  @IsString()
  @Length(1, 30)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  type?: SectionType;

  @IsObject()
  @IsOptional()
  data?: JSON;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
