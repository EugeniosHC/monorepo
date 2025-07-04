import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { AdminModule } from 'src/modules/admin/admin.module';
import { ProtectedController } from './controllers/protected.controller';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import appConfig from './config/app.config';
import ovgConfig from './config/ovg.config';
import emailConfig from './config/email.config';
import { CategoryModule } from 'src/modules/category/category.module';
import { CategorySectionModule } from 'src/modules/categorySection/section.module';
import { ProductModule } from 'src/modules/product/product.module';
import { SectionModule } from './modules/section/section.module';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { CloudflareModule } from 'src/modules/cloudflare/cloudflare.module';
import { ClassModule } from './modules/class/class.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, ovgConfig, emailConfig],
    }),
    ScheduleModule.forRoot(), // Habilitando o suporte a agendamento de tarefas
    AuthModule,
    AdminModule,
    CategoryModule,
    SectionModule,
    ProductModule,
    CategorySectionModule,
    PrismaModule,
    CloudflareModule,
    ClassModule,
    NotificationModule,
  ],
  controllers: [ProtectedController],
})
export class AppModule {}
