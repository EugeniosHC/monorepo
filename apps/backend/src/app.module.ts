// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { SectionModule } from './modules/section/section.module';
import { CloudflareModule } from './modules/cloudflare/cloudflare.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    AuthModule,
    CategoryModule,
    ProductModule,
    SectionModule,
    PrismaModule,
    CloudflareModule,
  ],
})
export class AppModule {}
