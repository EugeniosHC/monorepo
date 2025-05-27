import {
  Body,
  Controller,
  Get,
  UseGuards,
  Post,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { Product } from 'src/types';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateProductDto } from './dto/create-product';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAllProducts(): Promise<Product[] | null> {
    return this.productService.getAllProducts();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<Product> {
    return this.productService.createProduct(createProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() product: Product,
  ): Promise<Product> {
    return this.productService.updateProduct(id, product);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteProduct(@Param('id') id: string): Promise<Product> {
    return this.productService.deleteProduct(id);
  }
}
