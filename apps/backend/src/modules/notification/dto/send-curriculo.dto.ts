import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendCurriculoDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  function: Function;
}

enum Function {
  'Personal Trainer',
  'Monitor de Sala',
  'Professor Aulas de Grupo',
  'Consultor Comercial',
  'Receção',
  'Serviços Gerais',
  'Nutricionista',
}
