import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Section } from 'src/types';
import { SectionService } from './section.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Get()
  async getAllSections(): Promise<Section[] | null> {
    return this.sectionService.getAllSections();
  }
}
