import { File } from 'buffer';
import { IsNotEmpty, IsString, IsOptional, Length } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 40)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 40)
  slug: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 40)
  title: string;

  @IsString()
  @IsNotEmpty()
  subtitle: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsString()
  @IsNotEmpty()
  helpDescription: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;
}
