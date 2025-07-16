import { IsEmail, IsNotEmpty } from 'class-validator';

export class AddNewsletterDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
