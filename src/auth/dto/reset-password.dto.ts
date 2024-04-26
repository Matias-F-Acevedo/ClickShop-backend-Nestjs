import {IsNotEmpty, IsString, IsUUID, MaxLength, MinLength, } from "class-validator";

export class ResetPasswordDto {
    
    @IsNotEmpty()
    @IsUUID("4")
    resetPasswordToken:string;


    @IsString()
    @MinLength(8)
    @MaxLength(30)
    password: string;
}