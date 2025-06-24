import { Module } from '@nestjs/common';
import { OVGService } from './ovg.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      validateStatus: () => true, // Allow any status code to be handled (not throw errors)
    }),
  ],
  providers: [OVGService],
  exports: [OVGService],
})
export class OVGModule {}
