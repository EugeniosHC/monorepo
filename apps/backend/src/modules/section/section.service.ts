import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Section } from '@prisma/client';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { SectionType } from '@prisma/client';
import { validateSectionData } from './validator/validateSectionData.validator';

@Injectable()
export class SectionService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllSections(): Promise<Section[] | null> {
    return this.prismaService.section.findMany();
  }

  async getSectionByWebsiteAndType(
    website: string,
    type: SectionType,
  ): Promise<Section[] | null> {
    Logger.log(`Fetching section by website: "${website}" and type: "${type}"`);

    if (!website || !type) {
      throw new BadRequestException('Website ID and type are required');
    }

    const websiteExists = await this.prismaService.website.findFirst({
      where: {
        OR: [
          { name: website },
          { url: { contains: website, mode: 'insensitive' } },
        ],
      },
    });

    Logger.log(`Website lookup result: ${JSON.stringify(websiteExists)}`);

    if (!websiteExists) {
      Logger.error(
        `Website with name or URL containing "${website}" not found in database`,
      );
      throw new BadRequestException('Website not found');
    }

    if (!Object.values(SectionType).includes(type)) {
      throw new BadRequestException('Invalid section type');
    }

    return this.prismaService.section.findMany({
      where: {
        websiteId: websiteExists.id,
        type,
      },
    });
  }

  async getSectionById(id: string): Promise<Section | null> {
    if (!id) {
      Logger.error('ID parameter is empty');
      throw new BadRequestException('ID is required');
    }

    const section = await this.prismaService.section.findUnique({
      where: { id },
    });

    if (!section) {
      Logger.error(`Section with ID "${id}" not found`);
      throw new BadRequestException('Section not found');
    }

    return section;
  }

  async getSectionsByWebsite(websiteName: string): Promise<Section[] | null> {
    if (!websiteName) {
      Logger.error('Website name parameter is empty');
      throw new BadRequestException('Website name is required');
    }

    const websiteExists = await this.prismaService.website.findFirst({
      where: {
        name: websiteName,
      },
    });

    if (!websiteExists) {
      Logger.error(`Website with name "${websiteName}" not found`);
      throw new BadRequestException('Website not found');
    }

    return this.prismaService.section.findMany({
      where: {
        websiteId: websiteExists.id,
      },
    });
  }

  async getActiveSectionsByWebsite(
    website: string,
  ): Promise<Array<{ type: SectionType; section: Section | null }>> {
    if (!website) {
      Logger.error('Website parameter is empty');
      throw new BadRequestException('Website is required');
    }

    const websiteExists = await this.prismaService.website.findFirst({
      where: {
        OR: [
          { name: website },
          { url: { contains: website, mode: 'insensitive' } },
        ],
      },
    });

    if (!websiteExists) {
      throw new BadRequestException('Website not found');
    }

    // Get all available section types from the enum
    const sectionTypes = Object.values(SectionType);

    // Create an array to store the results
    const result: Array<{ type: SectionType; section: Section | null }> = [];

    // For each section type, find one active section (if it exists)
    for (const type of sectionTypes) {
      const section = await this.prismaService.section.findFirst({
        where: {
          websiteId: websiteExists.id,
          type,
          isActive: true,
        },
      });

      // Add the section type and the section (or null if not found) to the result
      result.push({
        type,
        section,
      });
    }

    return result;
  }

  async createSection(
    createSectionDto: CreateSectionDto,
    websiteName: string,
  ): Promise<Section | null> {
    const { title, type, data } = createSectionDto;

    const websiteExists = await this.prismaService.website.findFirst({
      where: { name: websiteName },
    });

    if (!websiteExists) {
      throw new BadRequestException('Website not found');
    }

    const existingSection = await this.prismaService.section.findFirst({
      where: {
        title,
      },
    });
    if (existingSection) {
      throw new BadRequestException('Section with this title already exists');
    }

    const isValid = validateSectionData(type, data);
    if (!isValid) {
      throw new BadRequestException('Invalid data for section type: ' + type);
    }

    return this.prismaService.section.create({
      data: {
        title: createSectionDto.title,
        description: createSectionDto.description,
        type: createSectionDto.type,
        data: createSectionDto.data as any,
        website: {
          connect: {
            id: websiteExists.id,
          },
        },
      },
    });
  }

  async updateSection(
    id: string,
    updateSectionDto: UpdateSectionDto,
  ): Promise<Section | null> {
    if (!id) {
      Logger.error('ID parameter is empty');
      throw new BadRequestException('ID is required');
    }

    Logger.log(`Attempting to update section with ID: "${id}"`);

    // Check if section exists
    const existingSection = await this.prismaService.section.findUnique({
      where: { id },
    });

    if (!existingSection) {
      Logger.error(`Section with ID "${id}" not found`);
      throw new BadRequestException(`Section with ID "${id}" not found`);
    }

    Logger.log(
      `Found section: ${existingSection.title} (Type: ${existingSection.type})`,
    );

    // If data is being updated, validate it against the section type
    if (updateSectionDto.data) {
      const sectionType = updateSectionDto.type || existingSection.type;
      Logger.log(`Validating data for section type: ${sectionType}`);
      Logger.log(
        `Data being validated: ${JSON.stringify(updateSectionDto.data, null, 2)}`,
      );

      const isValid = validateSectionData(sectionType, updateSectionDto.data);
      Logger.log(`Validation result: ${isValid}`);

      if (!isValid) {
        Logger.error(`Invalid data provided for section type: ${sectionType}`);
        throw new BadRequestException(
          'Invalid data for section type: ' + sectionType,
        );
      }
    }

    // If title is being updated, check for duplicates
    if (
      updateSectionDto.title &&
      updateSectionDto.title !== existingSection.title
    ) {
      const existingSectionWithTitle =
        await this.prismaService.section.findFirst({
          where: {
            title: updateSectionDto.title,
            id: { not: id }, // Exclude current section
          },
        });

      if (existingSectionWithTitle) {
        Logger.error(
          `Section with title "${updateSectionDto.title}" already exists`,
        );
        throw new BadRequestException('Section with this title already exists');
      }
    }

    Logger.log(`Updating section with ID: ${id}`);

    const updateData = {
      ...(updateSectionDto.title && { title: updateSectionDto.title }),
      ...(updateSectionDto.description !== undefined && {
        description: updateSectionDto.description,
      }),
      ...(updateSectionDto.type && { type: updateSectionDto.type }),
      ...(updateSectionDto.data && { data: updateSectionDto.data as any }),
      ...(updateSectionDto.isActive !== undefined && {
        isActive: updateSectionDto.isActive,
      }),
    };

    Logger.log(
      `Update data being sent to Prisma: ${JSON.stringify(updateData, null, 2)}`,
    );

    // Use a transaction to ensure the data is properly committed
    const updatedSection = await this.prismaService.$transaction(
      async (prisma) => {
        const result = await prisma.section.update({
          where: { id },
          data: updateData,
        });

        Logger.log(
          `Transaction - updated section: ${JSON.stringify(result.data, null, 2)}`,
        );
        return result;
      },
    );

    Logger.log(`Section updated successfully: ${updatedSection.id}`);
    Logger.log(
      `Updated section data: ${JSON.stringify(updatedSection.data, null, 2)}`,
    );

    // Verify the update by fetching the section again
    const verificationSection = await this.prismaService.section.findUnique({
      where: { id },
    });

    Logger.log(
      `Verification - section data in DB: ${JSON.stringify(verificationSection?.data, null, 2)}`,
    );

    return updatedSection;
  }
}
