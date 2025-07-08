import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AddLeadDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  mobile_number: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
