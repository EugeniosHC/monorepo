import { Module } from '@nestjs/common';
import { ClosumController } from './closum.controller';
import { ClosumService } from './closum.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      validateStatus: () => true,
    }),
  ],
  controllers: [ClosumController],
  providers: [ClosumService],
})
export class ClosumModule {}
