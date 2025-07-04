import { Type } from 'class-transformer';
import { ArrayMinSize, ValidateNested } from 'class-validator';

export class ExpressClass {
  nome: string;
  diaSemana: number;
  horaInicio: string;
  intensidade: string;
}

export class CreateExpressClassesDTO {
  @ValidateNested({ each: true })
  @Type(() => ExpressClass)
  @ArrayMinSize(1)
  classes: ExpressClass[];
}
