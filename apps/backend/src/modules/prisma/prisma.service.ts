// src/prisma/prisma.service.ts
import {
  Injectable,
  OnModuleInit,
  INestApplication,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      console.log('Aplicação está sendo encerrada...');
      await app.close();
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
