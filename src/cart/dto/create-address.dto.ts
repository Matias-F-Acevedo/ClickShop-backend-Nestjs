import { IsString,MinLength, MaxLength } from 'class-validator';

export class CreateAddressDto {

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
}
