
import { Expose } from 'class-transformer';
import { IsEnum, IsNumber, IsPositive, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';


export class CreateOrderDto {

    @Expose()
    @IsNumber()
    @IsPositive()
    user_id:number;

    @Expose()
    @IsString()
    @MinLength(4)
    @MaxLength(60)
    shippingAddress: string;

    @IsString()
    @MinLength(4)
    @MaxLength(60)
    city: string;

    @IsString()
    @MinLength(4)
    @MaxLength(60)
    province: string;

    @IsString()
    @MinLength(4)
    @MaxLength(60)
    postalCode: string;

    @IsString()
    @MinLength(4)
    @MaxLength(60)
    country: string;

    @IsEnum(OrderStatus)
    status: OrderStatus;

    @Expose()
    @IsPositive()
    @Min(0.01)
    @Max(99999999.99)
    total: number;

}
