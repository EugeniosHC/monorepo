import { ArrayMaxSize, IsBoolean, IsOptional, IsString } from 'class-validator';

export class AboutHighlightDto {
  @IsString()
  title: string;

  @IsString()
  subtitle: string;
}

import { Type } from 'class-transformer';
import { ValidateNested, ArrayMinSize } from 'class-validator';

export class AboutUsSectionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  videoUrl: string;

  @IsString()
  videoPoster: string;

  @ValidateNested({ each: true })
  @Type(() => AboutHighlightDto)
  @ArrayMaxSize(3)
  highlights: AboutHighlightDto[];
}
