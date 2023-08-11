import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
export class AddCarDto {
  @IsNotEmpty()
  model: string;

  @IsNotEmpty()
  brand: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  year: number;

  @IsNotEmpty()
  motor: string;

  @IsNotEmpty()
  mileage: string;

  @IsNotEmpty()
  box: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  price_with_driver: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  price_no_driver: number;

  @IsOptional()
  @IsString()
  image1: any;

  @IsOptional()
  @IsString()
  image2: any;

  @IsOptional()
  @IsString()
  image3: any;

  @IsOptional()
  @IsString()
  image4: any;

  @IsOptional()
  @IsString()
  type: string;
}
