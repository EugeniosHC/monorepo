import { Type } from 'class-transformer';
import { ValidateNested, ArrayMinSize } from 'class-validator';
import { ExpressClass } from './create-express-class.dto';

export class CreateExpressScheduleDto {
  titulo: string;
  @ValidateNested({ each: true })
  @Type(() => ExpressClass)
  @ArrayMinSize(1)
  classes: ExpressClass[];
}
