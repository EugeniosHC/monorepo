import { ClassModule } from './modules/class/class.module';
import { SectionModule } from './modules/section/section.module';
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { CategorySectionModule } from './modules/categorySection/section.module';
import { CloudflareModule } from './modules/cloudflare/cloudflare.module';
import ovgConfig from './config/ovg.config';

@Module({
  imports: [
    ClassModule,
    SectionModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, ovgConfig],
    }),
    AuthModule,
    CategoryModule,
    ProductModule,
    CategorySectionModule,
    PrismaModule,
    SectionModule,
    CloudflareModule,
  ],
})
export class AppModule {}
