import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SectionService } from './section.service';
import { Section, SectionType } from '@prisma/client';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { AuthGuard } from '../auth';

@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Get('/:id')
  async getSectionById(@Param('id') id: string): Promise<Section | null> {
    return this.sectionService.getSectionById(id);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getAllSections(): Promise<Section[] | null> {
    return this.sectionService.getAllSections();
  }

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
  @Post('/:website')
  async createSection(
    @Param('website') websiteName: string,
    @Body() createSectionDto: CreateSectionDto,
  ): Promise<Section> {
    return this.sectionService.createSection(createSectionDto, websiteName);
  }

  @UseGuards(AuthGuard)
  @Put('/:id')
  async updateSection(
    @Param('id') id: string,
    @Body() updateSectionDto: UpdateSectionDto,
  ): Promise<Section> {
    return this.sectionService.updateSection(id, updateSectionDto);
  }
}
