import { IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @Length(2, 35)
  name: string;

  @IsString()
  @Length(2, 35)
  description: string;

  @IsNumber()
  price: number;

  @IsString()
  imageUrl: string;

  @IsString()
  @IsOptional()
  duration?: string; // Duração do serviço, se aplicável
}
