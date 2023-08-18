import {
  IsNumber,
  IsNotEmpty,
  IsDate,
  IsString,
  IsEmail,
  IsBoolean,
} from 'class-validator';

export class AddRequestDto {
  @IsNumber()
  @IsNotEmpty()
  carId: number;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsBoolean()
  isDriver: boolean;

  @IsBoolean()
  isDelivery: boolean;

  @IsBoolean()
  isGoOutCity: boolean;

  @IsNotEmpty()
  @IsString()
  clientName: string;

  @IsNotEmpty()
  @IsString()
  clientPhone: string;

  @IsNotEmpty()
  @IsEmail()
  clientEmail: string;
}
