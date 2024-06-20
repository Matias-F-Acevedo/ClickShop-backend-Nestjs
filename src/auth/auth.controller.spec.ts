import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { LoginDto } from './dto/login.dto';




describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;


  const mockLogin = {
    email: "test.test123@gmail.com",
    password: "12345678"
  };

  const access_token = "TOKEN123"

  // jest.fn es una función proporcionada por la biblioteca de pruebas Jest, que se utiliza para crear funciones simuladas (mock functions).

  const mockAuthService = {
    login: jest.fn((email: string, password: string) => ({ access_token })),

    requestResetPassword: jest.fn((requestResetPasswordDto: RequestResetPasswordDto) => ({ message: 'Check your email and follow the steps to reset your password' })),

    resetPassword: jest.fn((resetPasswordDto: ResetPasswordDto) => ({ message: 'Password successfully reset' })),

    changePassword: jest.fn((changePassword: ChangePasswordDto, user) => ({ message: 'password was changed successfully' })),

  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          // proporciona una implementación simulada del servicio de users
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      // sobrescribe el guard de autenticación AuthGuard
      .overrideGuard(AuthGuard)
      // define un nuevo valor para el guard de autenticación,
      // en este caso, una función simulada que siempre permite la autorización (canActivate siempre devuelve true)
      .useValue({ canActivate: jest.fn(() => true) })
      // compila el módulo de prueba con las configuraciones y sobrescrituras anteriores
      .compile();

    // obtiene una instancia del controlador de usuarios a partir del módulo de prueba compilado
    controller = module.get<AuthController>(AuthController);
    // obtiene una instancia del servicio de usuarios a partir del módulo de prueba compilado
    service = module.get<AuthService>(AuthService);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(controller.login).toBeDefined();
    });

    it('should login', async () => {
      const loginDto: LoginDto = mockLogin;
      const result = await controller.login(loginDto);
      expect(result).toEqual({ access_token });
      expect(service.login).toHaveBeenCalledWith(loginDto.email,loginDto.password);
    });
  });

  describe('requestResetPassword', () => {
    it('should be defined', () => {
      expect(controller.requestResetPassword).toBeDefined();
    });

    it('You should send a request to reset your password and return a message with the steps to follow.', async () => {
      const requestResetPasswordDto: RequestResetPasswordDto = { email: mockLogin.email };
      const result = await controller.requestResetPassword(requestResetPasswordDto);
      expect(result).toEqual({ message: 'Check your email and follow the steps to reset your password' });
      expect(service.requestResetPassword).toHaveBeenCalledWith(requestResetPasswordDto);
    });
  });


  describe('resetPassword', () => {
    it('should be defined', () => {
      expect(controller.resetPassword).toBeDefined();
    });

    it('should reset the Password', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        resetPasswordToken: "jh453h53o4iutrji4t",
        password: "124354564"
      }
      const result = await controller.resetPassword(resetPasswordDto);
      expect(result).toEqual({ message: 'Password successfully reset' });
      expect(service.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    });
  });


  describe('changePassword', () => {
    it('should be defined', () => {
      expect(controller.changePassword).toBeDefined();
    });

    it('should change Password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        oldPassword: "12345678",
        newPassword: "12123jh1232"
      }
      const user = {
        email:"test.test1123@gmail.com"
      }
      const result = await controller.changePassword(changePasswordDto, user);
      expect(result).toEqual({ message: 'password was changed successfully'});
      expect(service.changePassword).toHaveBeenCalledWith(changePasswordDto,user);
    });
  });

});