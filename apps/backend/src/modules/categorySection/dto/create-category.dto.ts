import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCategorySectionDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 40)
  title: string;

  @IsNotEmpty()
  content: string;
}
