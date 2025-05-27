import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CloudflareService } from './cloudflare.service';
import { ImageGallery, Image } from 'src/types';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from '../product/product.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('cloudflare')
export class CloudflareController {
  constructor(
    private readonly cloudflareService: CloudflareService,
    private readonly productService: ProductService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getImageGallery(): Promise<ImageGallery> {
    return this.cloudflareService.getAllImages();
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<Image> {
    return this.cloudflareService.uploadToR2(file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  async deleteImages(
    @Body() body: { keys: string[] | string },
  ): Promise<{ deleted: string[]; notDeleted: string[]; inUse: string[] }> {
    try {
      // Delegate all logic to the service
      return await this.cloudflareService.deleteImagesIfNotInUse(
        body.keys,
        this.productService,
      );
    } catch (error) {
      throw new HttpException(
        `Failed to delete images: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
