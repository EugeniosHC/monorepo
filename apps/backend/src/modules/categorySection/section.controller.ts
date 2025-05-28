import { Controller, Get } from '@nestjs/common';
import { Section } from 'src/types';
import { SectionService } from './section.service';

@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Get()
  async getAllSections(): Promise<Section[] | null> {
    return this.sectionService.getAllSections();
  }
}
