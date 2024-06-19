import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Products } from 'src/products/entities/product.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { Repository } from 'typeorm';
import { ImagesService } from 'src/images/images.service';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockUser: CreateUserDto = {
  user_name: 'testUser',
  user_lastname: 'testUser',
  user_phoneNumber: '2281567890',
  user_address: 'Av. libertad 255',
  user_identificationNumber: '45678908',
  user_email: 'testUser.testUser123@hotmail.com',
  user_password: '12345678',
};


const mockUserWithoutPassword = {
  user_id: 1,
  user_name: 'testUser',
  user_lastname: 'testUser',
  user_phoneNumber: '2281567890',
  user_address: 'Av. libertad 255',
  user_identificationNumber: '45678908',
  user_email: 'testUser.testUser123@hotmail.com',
}


describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository;
  let productRepository: MockRepository;
  let cartRepository: MockRepository;
  let imageService: Partial<ImagesService>;

  beforeEach(async () => {
    userRepository = createMockRepository();
    productRepository = createMockRepository();
    cartRepository = createMockRepository();
    imageService = {
      getPublicUrl: jest.fn().mockResolvedValue('image_url'),
      uploadImage: jest.fn().mockResolvedValue('image_url'),
      deleteImage: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Products), useValue: productRepository },
        { provide: getRepositoryToken(Cart), useValue: cartRepository },
        { provide: ImagesService, useValue: imageService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = mockUser;

      const hashedPassword = bcrypt.hashSync(createUserDto.user_password, 8);
      const newUser = { ...createUserDto, user_password: hashedPassword };
      const savedUser = { ...newUser, user_id: 1 };

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(newUser);
      userRepository.save.mockResolvedValue(savedUser);
      const cart = {
        cart_id: 1,
        user_id: savedUser.user_id,
        total: 0.00
      }
      cartRepository.create.mockReturnValue(cart);


      const result = await service.create(createUserDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { user_email: createUserDto.user_email } });

      expect(userRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        user_password: expect.any(String), // esto es para evitar el problema con el hash de la contraseña (me genera otro hash).
      });

      expect(userRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(mockUserWithoutPassword);

    });

    it('should throw conflict exception if email is already registered', async () => {
      const createUserDto: CreateUserDto = mockUser
      const existingUser = { ...createUserDto, user_id: 1 };

      userRepository.findOne.mockResolvedValue(existingUser);

      const result = await service.create(createUserDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { user_email: createUserDto.user_email } });
      
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'User already exists');
      expect(result).toHaveProperty('status', HttpStatus.CONFLICT);
    });

  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ ...mockUser,user_image: 'image_path',user_id: 1 }];
      userRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(userRepository.find).toHaveBeenCalled();
      expect(imageService.getPublicUrl).toHaveBeenCalled();
      expect(result).toEqual([{ ...mockUserWithoutPassword, user_image: "image_url" }]);
    });

    it('should return empty array if no users found', async () => {
      userRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(userRepository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should throw INTERNAL SERVER ERROR if repository find fails', async () => {
      userRepository.find.mockRejectedValue(new Error('Database connection error'));
        const result = await service.findAll();
      
        expect(result).toBeInstanceOf(HttpException);
        expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
        expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });

  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { ...mockUser, user_image: 'image_path',user_id:1 };
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { user_id: 1} });
      expect(imageService.getPublicUrl).toHaveBeenCalledWith('image_path');
      expect(result).toEqual({ ...mockUserWithoutPassword, user_image: 'image_url' });
    });

    it('should throw not found exception if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(1);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { user_id: 1 } });
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'User does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw INTERNAL SERVER ERROR if repository find fails', async () => {
      userRepository.findOne.mockRejectedValue(new Error('Database connection error'));
        const result = await service.findOne(1);
      
        expect(result).toBeInstanceOf(HttpException);
        expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
        expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });


  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { user_name: 'updatedName' };
      const user = { ...mockUserWithoutPassword};
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.update(1, updateUserDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { user_id: 1 } });
      expect(userRepository.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual({ ...user, ...updateUserDto });
    });

    it('should throw conflict exception if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.update(1, { user_name: 'updatedName' });

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { user_id: 1 } });
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'User does not exist');
      expect(result).toHaveProperty('status', HttpStatus.CONFLICT);
    });

    it('should throw conflict exception if email is already in use', async () => {
      const updateUserDto: UpdateUserDto = { user_email: 'newemail@test.com' };
      const user = { ...mockUserWithoutPassword };
      userRepository.findOne.mockResolvedValueOnce(user);
      userRepository.findOne.mockResolvedValueOnce({ user_email: 'newemail@test.com' });

      const result = await service.update(1, updateUserDto);

      expect(userRepository.findOne).toHaveBeenCalledTimes(2);
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'Email not available');
      expect(result).toHaveProperty('status', HttpStatus.CONFLICT);
    });

    it('should throw INTERNAL SERVER ERROR if repository find fails', async () => {
      const updateUserDto: UpdateUserDto = { user_email: 'newemail@test.com' };
      userRepository.findOne.mockRejectedValue(new Error('Database connection error'));
        const result = await service.update(1, updateUserDto);
      
        expect(result).toBeInstanceOf(HttpException);
        expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
        expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const user = { ...mockUserWithoutPassword, user_image: 'image_path' };
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.remove(1);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { user_id: 1 } });
      expect(userRepository.delete).toHaveBeenCalledWith({ user_id: 1 });
      expect(result).toEqual(mockUserWithoutPassword);
    });

    it('should throw not found exception if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.remove(1);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { user_id: 1 } });
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'User does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw INTERNAL SERVER ERROR if repository find fails', async () => {
      userRepository.findOne.mockRejectedValue(new Error('Database connection error'));
        const result = await service.remove(1);
      
        expect(result).toBeInstanceOf(HttpException);
        expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
        expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user by email', async () => {
      const user = { ...mockUserWithoutPassword };
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.findUserByEmail('testUser.testUser123@hotmail.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { user_email: 'testUser.testUser123@hotmail.com' } });
      expect(result).toEqual(user);
    });

    it('should throw not found exception if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findUserByEmail('testUser.testUser123@hotmail.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { user_email: 'testUser.testUser123@hotmail.com' } });
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'User does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw INTERNAL SERVER ERROR if repository find fails', async () => {
      userRepository.findOne.mockRejectedValue(new Error('Database connection error'));
        const result = await service.findUserByEmail('testUser.testUser123@hotmail.com');
      
        expect(result).toBeInstanceOf(HttpException);
        expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
        expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('findUserByResetPasswordToken', () => {
    it('should return a user by reset password token', async () => {
      const user = { ...mockUserWithoutPassword };
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.findUserByResetPasswordToken('reset_token');

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { reset_password_token: 'reset_token' } });
      expect(result).toEqual(user);
    });

    it('should throw not found exception if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findUserByResetPasswordToken('reset_token');

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { reset_password_token: 'reset_token' } });
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'User not found');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw INTERNAL SERVER ERROR if repository find fails', async () => {
      userRepository.findOne.mockRejectedValue(new Error('Database connection error'));
        const result = await service.findUserByResetPasswordToken('reset_token');
      
        expect(result).toBeInstanceOf(HttpException);
        expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
        expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('getProfileImage', () => {
    it('should return profile image URL of the user', async () => {
      const user = { ...mockUserWithoutPassword, user_image: 'image_path' };
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.getProfileImage(1);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { user_id: 1 } });
      expect(imageService.getPublicUrl).toHaveBeenCalledWith('profile-images/1');
      expect(result).toEqual({ userId: 1, urlImage: 'image_url' });
    });

    it('should throw not found exception if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.getProfileImage(1);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { user_id: 1 } });
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'User does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw INTERNAL SERVER ERROR if repository find fails', async () => {
      userRepository.findOne.mockRejectedValue(new Error('Database connection error'));
        const result = await service.getProfileImage(1);
      
        expect(result).toBeInstanceOf(HttpException);
        expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
        expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('uploadProfileImage', () => {
    it('should upload profile image for the user', async () => {
      const user = { ...mockUserWithoutPassword };
      const file = {};
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.uploadProfileImage(1, file);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { user_id: 1 } });
      expect(result).toEqual({ userId: 1, urlImage: 'image_url' });
    });

    it('should throw not found exception if user does not exist', async () => {
      const file = {};
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.uploadProfileImage(1, file);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { user_id: 1 } });
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'User does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });
    it('should throw INTERNAL SERVER ERROR if repository find fails', async () => {
      userRepository.findOne.mockRejectedValue(new Error('Database connection error'));
        const result = await service.uploadProfileImage(1, {});
      
        expect(result).toBeInstanceOf(HttpException);
        expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
        expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('deleteProfileImage', () => {
    it('should delete profile image of the user', async () => {
      const user = { ...mockUserWithoutPassword, user_image: 'profile-images/1' };
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.deleteProfileImage(1);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { user_id: 1 } });
      expect(imageService.deleteImage).toHaveBeenCalledWith('profile-images/1');
      expect(userRepository.update).toHaveBeenCalledWith(1, { ...user, user_image: 'default-image-user/default-image-user.jpg' });
      expect(result).toEqual({ userId: 1, message: 'User profile image successfully deleted' });
    });

    it('should throw not found exception if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.deleteProfileImage(1);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { user_id: 1 } });
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'User does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw conflict exception if user does not have a profile image', async () => {
      const user = { ...mockUserWithoutPassword, user_image: 'default-image-user/default-image-user.jpg' };
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.deleteProfileImage(1);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { user_id: 1 } });
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'This user does not have a profile image');
      expect(result).toHaveProperty('status', HttpStatus.CONFLICT);
    });

    it('should throw INTERNAL SERVER ERROR if repository find fails', async () => {
      userRepository.findOne.mockRejectedValue(new Error('Database connection error'));
        const result = await service.deleteProfileImage(1);
      
        expect(result).toBeInstanceOf(HttpException);
        expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
        expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});