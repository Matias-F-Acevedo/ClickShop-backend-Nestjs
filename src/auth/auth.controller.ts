import { Controller, Post, Body, Patch, HttpException, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GetUser } from './get-user.decorator';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body()loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password)
  }


  @Patch("/request-reset-password")
  async requestResetPassword(@Body() requestResetPasswordDto: RequestResetPasswordDto):Promise<HttpException | {message:string}>{
    return this.authService.requestResetPassword(requestResetPasswordDto)
  }
  

  @Patch("/reset-password")
  async resetPassword(@Body()resetPasswordDto: ResetPasswordDto):Promise<HttpException | {message:string}>{
      return this.authService.resetPassword(resetPasswordDto)
  }


  // con el decorador @GetUser, obtengo el usaurio de la request y lo inyecto en el metodo. Se obtiene el user decifrando el token.

  @UseGuards(AuthGuard)
  @Patch("/change-password")
  async changePassword(@Body()changePasswordDto: ChangePasswordDto, @GetUser() user): Promise<HttpException | { message: string }>{
    return this.authService.changePassword(changePasswordDto,user)
  }

}
