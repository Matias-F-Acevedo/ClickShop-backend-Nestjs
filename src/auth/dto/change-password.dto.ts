import { IsString, MaxLength, MinLength, } from "class-validator";

export class ChangePasswordDto {
    
    @IsString()
    @MinLength(8)
    @MaxLength(30)
    oldPassword:string;


    @IsString()
    @MinLength(8)
    @MaxLength(30)
    newPassword: string;
}