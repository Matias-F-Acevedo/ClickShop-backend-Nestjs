import { HttpException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
describe('UsersService', () => {
  let usersService: UsersService;

  const mockUser = {
    user_name: 'testUser',
    user_lastname: 'testUser',
    user_phoneNumber: '2281567890',
    user_address: 'Av. libertad 255',
    user_identificationNumber: '45678908',
    user_email: 'testUser.testUser123@hotmail.com',
    user_password: '12345678',
  };

  const userRepositoryMock = {
    findOne: jest.fn(() => null),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const productRepositoryMock = {
  };

  const cartRepositoryMock = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const imageServiceMock = {
    getPublicUrl: jest.fn(),
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
  };


  beforeEach(() => {
    usersService = new UsersService(
      userRepositoryMock as any,
      productRepositoryMock as any,
      cartRepositoryMock as any,
      imageServiceMock as any,
    );
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });


  describe("create", () => {

    it("should be defined", () => {
      expect(usersService.create).toBeDefined();
    });

  });

});
