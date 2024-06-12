import {  IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';
import { ProductCondition } from '../entities/product.entity';

export class CreateProductDto {

   @Expose()
   @IsPositive()
   category_id: number;
   
   @Expose()
   @IsPositive()
   user_id: number;
   
   @Expose()
   @IsNotEmpty()
   @IsString()
   @MinLength(3)
   @MaxLength(55)
   product_name: string;

   @Expose()
   @IsNotEmpty()
   @IsNumber()
   price: number;

   @Expose()
   @IsPositive()
   stock: number;

   @Expose()   
   @IsString()
   @MinLength(5)
   @MaxLength(255)
   description: string;

   @IsEnum(ProductCondition)
   condition: ProductCondition;
   
}

