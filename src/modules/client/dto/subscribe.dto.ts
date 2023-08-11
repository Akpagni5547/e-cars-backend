import { IsEmail, IsNotEmpty } from 'class-validator';

export class ClientSubscribeDto {
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  /*   @IsNotEmpty()
  password: string; */

  @IsNotEmpty()
  name: string;
}
