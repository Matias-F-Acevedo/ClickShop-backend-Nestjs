import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { BadRequestException, HttpException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UsersService;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findUserByEmail: jest.fn(),
            findUserByResetPasswordToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    mailerService = module.get<MailerService>(MailerService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('login', () => {
    it('should return an access token if credentials are valid', async () => {
      const user = new User();
      user.user_password = bcrypt.hashSync('password', 8);

      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('access_token');

      const result = await authService.login('email@example.com', 'password');
      expect(result).toEqual({ access_token: 'access_token' });
    });

    it('should throw HttpException if user does not exist', async () => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);

      await expect(authService.login('email@example.com', 'password')).rejects.toThrow(HttpException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const user = new User();
      user.user_password = bcrypt.hashSync('password', 8);

      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      await expect(authService.login('email@example.com', 'password')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('requestResetPassword', () => {
    it('should send reset password email if user exists', async () => {
      const user = new User();
      user.user_email = 'email@example.com';
      user.user_name = 'John Doe';

      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      jest.spyOn(mailerService, 'sendMail').mockResolvedValue(null);

      const requestResetPasswordDto: RequestResetPasswordDto = { email: 'email@example.com' };
      const result = await authService.requestResetPassword(requestResetPasswordDto);

      expect(result).toEqual({ message: 'Check your email and follow the steps to reset your password' });
      expect(mailerService.sendMail).toHaveBeenCalled();
    });

    it('should return HttpException if user does not exist', async () => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);

      const requestResetPasswordDto: RequestResetPasswordDto = { email: 'email@example.com' };
      const result = await authService.requestResetPassword(requestResetPasswordDto);

      expect(result).toBeInstanceOf(HttpException);
    });
  });

  describe('resetPassword', () => {
    it('should reset the password if token is valid', async () => {
      const user = new User();
      user.user_email = 'email@example.com';
      user.user_name = 'John Doe';

      jest.spyOn(userService, 'findUserByResetPasswordToken').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashedPassword');
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      jest.spyOn(mailerService, 'sendMail').mockResolvedValue(null);

      const resetPasswordDto: ResetPasswordDto = { resetPasswordToken: 'valid-token', password: 'newPassword' };
      const result = await authService.resetPassword(resetPasswordDto);

      expect(result).toEqual({ message: 'Password successfully reset' });
      expect(mailerService.sendMail).toHaveBeenCalled();
    });

    it('should return HttpException if token is invalid', async () => {
      jest.spyOn(userService, 'findUserByResetPasswordToken').mockResolvedValue(null);

      const resetPasswordDto: ResetPasswordDto = { resetPasswordToken: 'invalid-token', password: 'newPassword' };
      const result = await authService.resetPassword(resetPasswordDto);

      expect(result).toBeInstanceOf(HttpException);
    });
  });

  describe('changePassword', () => {
    it('should change the password if old password matches', async () => {
      const user = new User();
      user.user_email = 'email@example.com';
      user.user_password = bcrypt.hashSync('oldPassword', 8);

      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashedNewPassword');
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);

      const changePasswordDto: ChangePasswordDto = { oldPassword: 'oldPassword', newPassword: 'newPassword' };
      const result = await authService.changePassword(changePasswordDto, { email: 'email@example.com' });

      expect(result).toEqual({ message: 'password was changed successfully' });
    });

    it('should return HttpException if user does not exist', async () => {
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(null);

      const changePasswordDto: ChangePasswordDto = { oldPassword: 'oldPassword', newPassword: 'newPassword' };
      const result = await authService.changePassword(changePasswordDto, { email: 'email@example.com' });

      expect(result).toBeInstanceOf(HttpException);
    });

    it('should throw BadRequestException if old password does not match', async () => {
      const user = new User();
      user.user_email = 'email@example.com';
      user.user_password = bcrypt.hashSync('oldPassword', 8);

      jest.spyOn(userService, 'findUserByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      const changePasswordDto: ChangePasswordDto = { oldPassword: 'oldPassword', newPassword: 'newPassword' };

      await expect(authService.changePassword(changePasswordDto, { email: 'email@example.com' })).rejects.toThrow(BadRequestException);
    });

    it('should throw HttpException if old and new passwords are the same', async () => {
      const changePasswordDto: ChangePasswordDto = { oldPassword: 'password', newPassword: 'password' };

      await expect(authService.changePassword(changePasswordDto, { email: 'email@example.com' })).rejects.toThrow(HttpException);
    });
  });
});
