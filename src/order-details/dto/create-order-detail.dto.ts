import { Expose } from 'class-transformer';
import {  IsPositive,  Max,  Min,  } from 'class-validator';

export class CreateOrderDetailDto {
    @Expose()
    @IsPositive()
    order_id: number;

    @Expose()
    @IsPositive()
    product_id: number;

    @Expose()
    @IsPositive()
    quantity: number;

    @Expose()
    @IsPositive()
    @Min(0.01)
    @Max(99999999.99)
    unitPrice: number;
    
}
