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
import { CreateProductDto } from './dto/create-product';
import { AuthGuard } from '../auth';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAllProducts(): Promise<Product[] | null> {
    return this.productService.getAllProducts();
  }

  @UseGuards(AuthGuard)
  @Post()
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<Product> {
    return this.productService.createProduct(createProductDto);
  }

  @UseGuards(AuthGuard)
  @Put('/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() product: Product,
  ): Promise<Product> {
    return this.productService.updateProduct(id, product);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  async deleteProduct(@Param('id') id: string): Promise<Product> {
    return this.productService.deleteProduct(id);
  }
}
