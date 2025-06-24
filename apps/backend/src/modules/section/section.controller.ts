import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SectionService } from './section.service';
import { Section, SectionType } from '@prisma/client';
import { CreateSectionDto } from './dto/create-section.dto';

@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Get()
  async getAllSections(): Promise<Section[] | null> {
    return this.sectionService.getAllSections();
  }

  @Get('/:website')
  async getSectionsByWebsite(
    @Param('website') websiteName: string,
  ): Promise<Section[] | null> {
    return this.sectionService.getSectionsByWebsite(websiteName);
  }

  @Get('/active/:website')
  async getActiveSectionsByWebsite(
    @Param('website') website: string,
  ): Promise<Array<{ type: SectionType; section: Section | null }>> {
    return this.sectionService.getActiveSectionsByWebsite(website);
  }

  @Get('/:website/:type')
  async getSectionByWebsiteAndType(
    @Param('website') websiteId: string,
    @Param('type') type: SectionType,
  ): Promise<Section[] | null> {
    return this.sectionService.getSectionByWebsiteAndType(websiteId, type);
  }

  @Post('/:website')
  async createSection(
    @Param('website') websiteName: string,
    @Body() createSectionDto: CreateSectionDto,
  ): Promise<Section> {
    return this.sectionService.createSection(createSectionDto, websiteName);
  }
}
