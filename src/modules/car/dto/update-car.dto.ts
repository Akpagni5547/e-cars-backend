import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
export class UpdateCarDto {
  @IsOptional()
  model: string;

  @IsOptional()
  brand: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year: number;

  @IsOptional()
  motor: string;

  @IsOptional()
  mileage: string;

  @IsOptional()
  box: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price_with_driver: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price_no_driver: number;

  @IsOptional()
  @IsString()
  image1: string;

  @IsOptional()
  @IsString()
  image2: string;

  @IsOptional()
  @IsString()
  image3: string;

  @IsOptional()
  @IsString()
  image4: string;

  @IsOptional()
  @IsString()
  type: string;
}
