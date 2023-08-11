import { IsNotEmpty } from 'class-validator';

export class ClientCredentialsDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}
