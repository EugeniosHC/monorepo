/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ClassService } from './class.service';
import { GetClassesDto } from './dto/get-classes.dto';

@Controller('class')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get()
  async getAllClasses(
    @Query(new ValidationPipe({ transform: true })) query: GetClassesDto,
  ): Promise<any[] | null> {
    return this.classService.getAllClasses(query.date);
  }

  /*
  @Post('express-classes')
  async createExpressClass(
    @Body(new ValidationPipe({ transform: true }))
    createExpressClassesDto: CreateExpressClassesDTO,
  ): Promise<any> {
    return this.classService.createExpressClasses(createExpressClassesDto);
  }
  */
}
