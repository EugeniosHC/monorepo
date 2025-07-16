import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { HeroSectionDto } from '../dto/hero-section.dto';
import { MarqueeSectionDto } from '../dto/marquee-section.dto';
import { SectionType } from '@prisma/client';
import { Logger } from '@nestjs/common';

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
      Logger.error(`Unknown section type: ${type}`);
      return false;
  }

  try {
    const instance = plainToInstance(dtoClass, data);
    Logger.log(`Transformed instance: ${JSON.stringify(instance, null, 2)}`);

    const errors = validateSync(instance, { whitelist: true });

    if (errors.length > 0) {
      Logger.error(
        `Validation errors: ${JSON.stringify(
          errors.map((e) => ({
            property: e.property,
            constraints: e.constraints,
            value: e.value,
          })),
          null,
          2,
        )}`,
      );
    }

    return errors.length === 0;
  } catch (error) {
    Logger.error(`Error during validation: ${error.message}`);
    return false;
  }
}
