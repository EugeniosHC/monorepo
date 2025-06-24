import { ClassService } from './class.service';
import { ClassController } from './class.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { OVGModule } from '../ovg/ovg.module';

@Module({
  imports: [OVGModule],
  controllers: [ClassController],
  providers: [ClassService],
})
export class ClassModule {}
