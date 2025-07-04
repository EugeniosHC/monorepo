import { Module } from '@nestjs/common';
import { CloudflareController } from './cloudflare.controller';
import { CloudflareService } from './cloudflare.service';
import { ProductModule } from '../product/product.module';
import { AuthModule } from '../auth';

@Module({
  imports: [ProductModule, AuthModule],
  controllers: [CloudflareController],
  providers: [CloudflareService],
  exports: [CloudflareService],
})
export class CloudflareModule {}
