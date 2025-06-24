import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class HeroSlideDto {
  @IsString()
  title: string;

  @IsString()
  subtitle: string;

  @IsBoolean()
  buttonIsVisible: boolean;

  @IsString()
  buttonText: string;

  @IsString()
  buttonUrl: string;

  @IsString()
  @IsOptional()
  buttonIcon?: string;

  @IsString()
  imageUrl: string;

  @IsString()
  imageAlt: string;
}

import { Type } from 'class-transformer';
import { ValidateNested, ArrayMinSize } from 'class-validator';

export class HeroSectionDto {
  @ValidateNested({ each: true })
  @Type(() => HeroSlideDto)
  @ArrayMinSize(1)
  slides: HeroSlideDto[];

  
}
