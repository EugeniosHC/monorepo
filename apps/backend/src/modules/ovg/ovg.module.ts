import { Module } from '@nestjs/common';
import { OVGService } from './ovg.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      validateStatus: () => true,
    }),
  ],
  providers: [OVGService],
  exports: [OVGService],
})
export class OVGModule {}
