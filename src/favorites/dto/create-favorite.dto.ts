import { Expose } from 'class-transformer';
import {IsPositive, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';


export class CreateFavoriteDto {

    @Expose()
    @IsPositive()
    product_id: number;

    @Expose()
    @IsPositive()
    user_id: number;

}
