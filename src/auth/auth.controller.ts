import { Controller, Post, Body, Patch, HttpException} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { User } from 'src/users/entities/user.entity';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body()loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password)
  }


  @ApiBearerAuth()
  @Patch("/request-reset-password")
  async requestResetPassword(@Body() requestResetPasswordDto: RequestResetPasswordDto):Promise<HttpException | {message:string}>{
    return this.authService.requestResetPassword(requestResetPasswordDto)
  }
  
  @ApiBearerAuth()
  @Patch("/reset-password")
  async resetPassword(@Body()resetPasswordDto: ResetPasswordDto):Promise<HttpException | {message:string}>{
      return this.authService.resetPassword(resetPasswordDto)
  }

}
