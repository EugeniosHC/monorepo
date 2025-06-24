import { Type } from 'class-transformer';
import { IsString, ValidateNested, ArrayMinSize } from 'class-validator';

export class MarqueeIconsDto {
  @IsString()
  icon: string;

  @IsString()
  iconLibrary: 'tabler' | 'lucide';

  @IsString()
  description: string;
}

export class MarqueeSectionDto {
  @ValidateNested({ each: true })
  @Type(() => MarqueeIconsDto)
  @ArrayMinSize(1)
  icons: MarqueeIconsDto[];
}
