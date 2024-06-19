import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let mockFavoriteRepository;
  let mockUsersService;
  let mockProductsService;

  beforeEach(async () => {
    mockFavoriteRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockUsersService = {
      findOne: jest.fn(),
    };

    mockProductsService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: getRepositoryToken(Favorite),
          useValue: mockFavoriteRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  describe('findAllFavorites', () => {
    it('should find all favorites for a user successfully', async () => {
      const favorites = [
        { user_id: 1, product_id: 1 },
        { user_id: 1, product_id: 2 },
      ];
      const product1 = { product_name: 'Product1', price: 100, description: 'Desc1', stock: 10, condition: 'New', product_image: ['image1'] };
      const product2 = { product_name: 'Product2', price: 200, description: 'Desc2', stock: 20, condition: 'New', product_image: ['image2'] };

      mockFavoriteRepository.find.mockResolvedValue(favorites);
      mockProductsService.findOne.mockResolvedValueOnce(product1).mockResolvedValueOnce(product2);

      const result = await service.findAllFavorites(1);

      expect(result).toEqual([
        { ...favorites[0], product: { ...product1, product_image: 'image1' } },
        { ...favorites[1], product: { ...product2, product_image: 'image2' } },
      ]);
    });

    it('should handle products that return HttpException', async () => {
      const favorites = [{ user_id: 1, product_id: 1 }];
      mockFavoriteRepository.find.mockResolvedValue(favorites);
      mockProductsService.findOne.mockResolvedValue(new HttpException('Product not found', HttpStatus.NOT_FOUND));

      const result = await service.findAllFavorites(1);

      expect(result).toEqual(favorites);
    });

    it('should throw internal server error if an error occurs', async () => {
      mockFavoriteRepository.find.mockRejectedValue(new Error('Database error'));

      const result = await service.findAllFavorites(1);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('addFavorite', () => {
    it('should add a favorite successfully', async () => {
      const createFavoriteDto = { user_id: 1, product_id: 1 };
      const favorite = { id: 1, ...createFavoriteDto };

      mockUsersService.findOne.mockResolvedValue({});
      mockProductsService.findOne.mockResolvedValue({});
      mockFavoriteRepository.findOne.mockResolvedValue(null);
      mockFavoriteRepository.create.mockReturnValue(favorite);
      mockFavoriteRepository.save.mockResolvedValue(favorite);

      const result = await service.addFavorite(createFavoriteDto);

      expect(result).toEqual(favorite);
    });

    it('should throw not found exception if user does not exist', async () => {
      const createFavoriteDto = { user_id: 1, product_id: 1 };
      mockUsersService.findOne.mockResolvedValue(new HttpException('User not found', HttpStatus.NOT_FOUND));

      const result = await service.addFavorite(createFavoriteDto);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'The user does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw not found exception if product does not exist', async () => {
      const createFavoriteDto = { user_id: 1, product_id: 1 };
      mockUsersService.findOne.mockResolvedValue({});
      mockProductsService.findOne.mockResolvedValue(new HttpException('Product not found', HttpStatus.NOT_FOUND));

      const result = await service.addFavorite(createFavoriteDto);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'The product does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw conflict exception if favorite already exists', async () => {
      const createFavoriteDto = { user_id: 1, product_id: 1 };
      mockUsersService.findOne.mockResolvedValue({});
      mockProductsService.findOne.mockResolvedValue({});
      mockFavoriteRepository.findOne.mockResolvedValue(createFavoriteDto);

      const result = await service.addFavorite(createFavoriteDto);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', "There is already a registered user's favorite for the product");
      expect(result).toHaveProperty('status', HttpStatus.CONFLICT);
    });

    it('should throw internal server error if an error occurs', async () => {
      const createFavoriteDto = { user_id: 1, product_id: 1 };
      mockUsersService.findOne.mockRejectedValue(new Error('Database error'));

      const result = await service.addFavorite(createFavoriteDto);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite successfully', async () => {
      const favorite = { user_id: 1, product_id: 1 };

      mockFavoriteRepository.findOne.mockResolvedValue(favorite);
      mockFavoriteRepository.delete.mockResolvedValue(favorite);

      const result = await service.removeFavorite(1, 1);

      expect(result).toEqual(favorite);
    });

    it('should throw not found exception if favorite does not exist', async () => {
      mockFavoriteRepository.findOne.mockResolvedValue(null);

      const result = await service.removeFavorite(1, 1);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'The Favorite does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw bad request exception if an error occurs', async () => {
      mockFavoriteRepository.findOne.mockRejectedValue(new Error('Invalid ID'));

      const result = await service.removeFavorite(1, 1);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'The provided ID parameter is invalid');
      expect(result).toHaveProperty('status', HttpStatus.BAD_REQUEST);
    });
  });
});
