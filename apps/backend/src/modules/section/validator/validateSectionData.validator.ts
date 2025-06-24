import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { HeroSectionDto } from '../dto/hero-section.dto';
import { MarqueeSectionDto } from '../dto/marquee-section.dto';
import { SectionType } from '@prisma/client';

export function validateSectionData(type: SectionType, data: any): boolean {
  let dtoClass;

  switch (type) {
    case SectionType.HERO:
      dtoClass = HeroSectionDto;
      break;
    case SectionType.MARQUEE:
      dtoClass = MarqueeSectionDto;
      break;
    default:
      return false;
  }

  const instance = plainToInstance(dtoClass, data);
  const errors = validateSync(instance, { whitelist: true });

  return errors.length === 0;
}
