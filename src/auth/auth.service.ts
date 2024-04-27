import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordDto } from './dto/reset-password.dto';


@Injectable()
export class AuthService {

  constructor(private userService: UsersService, private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly mailerService: MailerService,
  ) { }

  async login(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);

    if (!(user instanceof User)) {
      return new HttpException('User does not exist', HttpStatus.NOT_FOUND);
    }

    if (!bcrypt.compareSync(password, user.user_password)) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.user_id, name: user.user_name, lastName: user.user_lastname, email: user.user_email };

    return { access_token: await this.jwtService.signAsync(payload) };

  }


  async requestResetPassword(requestResetPasswordDto: RequestResetPasswordDto): Promise<HttpException | { message: string }> {
    const user = await this.userService.findUserByEmail(requestResetPasswordDto.email)

    if (!(user instanceof User)) {
      return new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user.reset_password_token = uuidv4();
    this.userRepository.save(user);

    this.mailerService.sendMail({
      to: user.user_email,
      from: "ClickShop",
      subject: "Restablecer contraseña de inicio de sesión",
      text: ``,
      html: `<b><h3>Estimado ${user.user_name},</h3></b> <p>Desde <b>ClickShop</b> hemos recibido tu solicitud de restablecimiento de contraseña. Para completar este proceso y recuperar el acceso a tu cuenta, sigue los pasos a continuación:</p>
      <p> 1. Haz clic en el siguiente enlace para acceder a la página de restablecimiento de contraseña: <a href= "http://localhost:5173/reset-password?token=${user.reset_password_token}" target="_blank" >Haz click aquí</a></p>
      <p>2. Una vez en la página, sigue las instrucciones para crear una nueva contraseña segura.</p>
      <p>3. Después de establecer tu nueva contraseña, podrás iniciar sesión en tu cuenta utilizando las credenciales actualizadas.</p>
      
      <p>Si no solicitaste este restablecimiento de contraseña o necesitas ayuda adicional, no dudes en ponerte en contacto con nuestro equipo de soporte en clickshop836@gmail.com.</p>
      
      <p><b>Gracias por tu cooperación.</b></p>

      Atentamente, <b>ClickShop.</b>`,
    })
    return { message: 'Check your email and follow the steps to reset your password' };

  }


  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<HttpException | { message: string }> {
    const user = await this.userService.findUserByResetPasswordToken(resetPasswordDto.resetPasswordToken)

    if (!(user instanceof User)) {
      return new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user.user_password = bcrypt.hashSync(resetPasswordDto.password, 8);
    user.reset_password_token = null;
    this.userRepository.save(user);

    await this.mailerService.sendMail({
      to: user.user_email,
      from: "ClickShop",
      subject: "Confirmación de restablecimiento de contraseña",
      text: ``,
      html:`<b><h3>Estimado ${user.user_name},</h3></b> <p>Desde <b>ClickShop</b> te escribimos para informarte que tu contraseña ha sido restablecida satisfactoriamente. Ahora puedes acceder a tu cuenta utilizando tus nuevas credenciales.</p>

      <p>A continuación, te recordamos algunos consejos de seguridad para mantener tu cuenta protegida:</p>

      <p> 1. No compartas tu contraseña con nadie y evita usar la misma contraseña en múltiples servicios.</p>
      <p>2. Utiliza una combinación de letras, números y caracteres especiales para crear contraseñas seguras.</p>
      <p>3. Mantén tu contraseña confidencial y cámbiala regularmente como medida preventiva.</p>
      
      <p>Si tienes alguna pregunta o necesitas asistencia adicional, no dudes en contactar a nuestro equipo de soporte en clickshop836@gmail.com.</p>
      
      <p><b>Gracias por confiar en nosotros.</b></p>

      Atentamente, <b>ClickShop.</b>`,
    })

    return { message: 'Password successfully reset' };
  }
}
