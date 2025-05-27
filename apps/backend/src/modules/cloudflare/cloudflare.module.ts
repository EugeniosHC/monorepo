import { Module } from '@nestjs/common';
import { CloudflareController } from './cloudflare.controller';
import { CloudflareService } from './cloudflare.service';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [ProductModule],
  controllers: [CloudflareController],
  providers: [CloudflareService],
  exports: [CloudflareService],
})
export class CloudflareModule {}
