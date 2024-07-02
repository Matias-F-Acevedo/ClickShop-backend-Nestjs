import { IsString, IsNumber, IsNotEmpty, IsPositive } from 'class-validator';

export class ItemDto {
  
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantity: number;

  // @IsString()
  // currency_id?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  unit_price: number;
}