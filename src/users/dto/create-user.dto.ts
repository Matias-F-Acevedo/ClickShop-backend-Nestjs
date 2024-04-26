import { Expose } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';


export class CreateUserDto {
   
    @Expose()
    @IsString()
    @MinLength(3)
    @MaxLength(15)
    user_name: string;

    @Expose()
    @IsString()
    @MinLength(3)
    @MaxLength(15)
    user_lastname: string;

    @Expose()
    @IsString()
    @MinLength(7)
    @MaxLength(15)
    user_phoneNumber: string;

    @Expose()
    @IsString()
    @MinLength(4)
    @MaxLength(60)
    user_address: string;

    @Expose()
    @IsString()
    @MinLength(7)
    @MaxLength(9)
    user_identificationNumber: string;

    @Expose()
    @IsString()
    @IsEmail()
    user_email: string;

    @Expose()
    @IsString()
    @MinLength(8)
    @MaxLength(30)
    user_password: string;

  


}
