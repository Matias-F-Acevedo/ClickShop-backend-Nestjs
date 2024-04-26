import { Expose } from 'class-transformer';
import {IsPositive, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';


export class CreateReviewDto {

    @Expose()
    @IsPositive()
    product_id: number;

    @Expose()
    @IsPositive()
    user_id: number;

    @Expose()
    @IsPositive()
    @Min(1)
    @Max(5)
    score: number;

    @Expose()
    @IsString()
    @MinLength(10)
    @MaxLength(255)
    commentary: string;

}
