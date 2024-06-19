import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { HttpException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserInterface } from './interface/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';



describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;


  const mockUser = {
    user_name: "testUser",
    user_lastname: "testUser",
    user_phoneNumber: "2281567890",
    user_address: "Av. libertad 255",
    user_identificationNumber: "45678908",
    user_email: "testUser.testUser123@hotmail.com",
    user_password: "12345678"
  };

  // jest.fn es una función proporcionada por la biblioteca de pruebas Jest, que se utiliza para crear funciones simuladas (mock functions).

  const mockUserService = {
    create: jest.fn((dto: CreateUserDto) => ({ user_id: 1, ...dto })),

    findAll: jest.fn(() => [{ user_id: 1, ...mockUser }]),

    findOne: jest.fn((id: number) => ({ id, ...mockUser })),

    update: jest.fn((id: number, dto: UpdateUserDto) => ({ id, ...dto })),

    remove: jest.fn((id: number) => ({ id, ...mockUser })),

    getProfileImage: jest.fn((userId: number) => ({ userId: userId, urlImage: 'http://image.url' })),

    uploadProfileImage: jest.fn((userId: number, file: any) => ({ userId: userId, urlImage: 'http://image.url' })),

    deleteProfileImage: jest.fn((userId: number) => ({ userId: userId, message: "User profile image successfully deleted" })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          // proporciona una implementación simulada del servicio de users
          provide: UsersService,
          useValue: mockUserService,
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
    controller = module.get<UsersController>(UsersController);
    // obtiene una instancia del servicio de usuarios a partir del módulo de prueba compilado
    service = module.get<UsersService>(UsersService);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(controller.create).toBeDefined();
    });
  
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = mockUser;
      const result = await controller.create(createUserDto);
      expect(result).toEqual({user_id: 1,...createUserDto});
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should be defined', () => {
      expect(controller.findAll).toBeDefined();
    });

    it('should return an array of users', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([{ user_id: 1, ...mockUser }]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should be defined', () => {
      expect(controller.findOne).toBeDefined();
    });

    it('should return a user', async () => {
      const id = '1';
      const result = await controller.findOne(id);
      expect(result).toEqual({ id: 1, ...mockUser });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should be defined', () => {
      expect(controller.update).toBeDefined();
    });

    it('should update a user', async () => {
      const id = '1';
      const updateUserDto: UpdateUserDto = { user_name: 'Updated User' };
      const result = await controller.update(id, updateUserDto);
      expect(result).toEqual({ id: 1, ...updateUserDto });
      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should be defined', () => {
      expect(controller.remove).toBeDefined();
    });

    it('should remove a user', async () => {
      const id = '1';
      const result = await controller.remove(id);
      expect(result).toEqual({ id: 1, ...mockUser});
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('getProfileImage', () => {
    it('should be defined', () => {
      expect(controller.getProfileImage).toBeDefined();
    });

    it('should get profile image of a user', async () => {
      const userId = '1';
      const result = await controller.getProfileImage(userId);
      expect(result).toEqual({ userId: 1, urlImage: 'http://image.url' });
      expect(service.getProfileImage).toHaveBeenCalledWith(1);
    });
  });

  describe('uploadProfileImage', () => {
    it('should be defined', () => {
      expect(controller.uploadProfileImage).toBeDefined();
    });

    it('should upload profile image of a user', async () => {
      const userId = '1';
      // archivo de imagen simulado:
      const file = { buffer: Buffer.from('test') };
      const result = await controller.uploadProfileImage(userId, file);
      expect(result).toEqual({ userId: 1, urlImage: 'http://image.url' });
      expect(service.uploadProfileImage).toHaveBeenCalledWith(1, file);
    });
  });

  describe('deleteProfileImage', () => {
    it('should be defined', () => {
      expect(controller.deleteProfileImage).toBeDefined();
    });

    it('should delete profile image of a user', async () => {
      const userId = '1';
      const result = await controller.deleteProfileImage(userId);
      expect(result).toEqual({ userId: 1, message: "User profile image successfully deleted"});
      expect(service.deleteProfileImage).toHaveBeenCalledWith(1);
    });
  });

  
});