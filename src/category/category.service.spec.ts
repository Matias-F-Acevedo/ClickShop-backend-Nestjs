import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoryService', () => {
  let service: CategoryService;
  let mockCategoryRepository;

  beforeEach(async () => {
    mockCategoryRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });


  describe('create', () => {
    it('should create a category successfully', async () => {
      const createCategoryDto = { name: 'Electronics', description: 'All electronic items' };
      mockCategoryRepository.findOne.mockResolvedValue(null);
      mockCategoryRepository.create.mockReturnValue(createCategoryDto);
      mockCategoryRepository.save.mockResolvedValue(createCategoryDto);

      const result = await service.create(createCategoryDto);

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({ where: { name: 'Electronics' } });
      expect(result).toEqual(createCategoryDto);
    });

    it('should throw conflict exception if category name already exists', async () => {
      const createCategoryDto = { name: 'Electronics', description: 'All electronic items' };
      mockCategoryRepository.findOne.mockResolvedValue(createCategoryDto);

      const result = await service.create(createCategoryDto);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'Category with this name already exists');
      expect(result).toHaveProperty('status', HttpStatus.CONFLICT);
    });

    it('should throw internal server error if an error occurs', async () => {
      const createCategoryDto = { name: 'Electronics', description: 'All electronic items' };
      mockCategoryRepository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await service.create(createCategoryDto);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });


  describe('findAll', () => {
    it('should find all categories successfully', async () => {
      const categories = [{ id: 1, name: 'Electronics', description: 'All electronic items' }];
      mockCategoryRepository.find.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(result).toEqual(categories);
    });

    it('should throw internal server error if an error occurs', async () => {
      mockCategoryRepository.find.mockRejectedValue(new Error('Database error'));

      const result = await service.findAll();

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });


  describe('findOne', () => {
    it('should find a category by id successfully', async () => {
      const category = { id: 1, name: 'Electronics', description: 'All electronic items' };
      mockCategoryRepository.findOne.mockResolvedValue(category);

      const result = await service.findOne(1);

      expect(result).toEqual(category);
    });

    it('should throw not found exception if category does not exist', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(1);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'Category not found');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw internal server error if an error occurs', async () => {
      mockCategoryRepository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await service.findOne(1);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });


  describe('update', () => {
    it('should update a category successfully', async () => {
      const updateCategoryDto = { name: 'Electronics', description: 'Updated description' };
      const category = { id: 1, name: 'Electronics', description: 'Old description' };
      mockCategoryRepository.findOne.mockResolvedValueOnce(category);
      mockCategoryRepository.findOne.mockResolvedValueOnce(null);
      mockCategoryRepository.save.mockResolvedValue({ ...category, ...updateCategoryDto });

      const result = await service.update(1, updateCategoryDto);

      expect(result).toEqual({ ...category, ...updateCategoryDto });
    });

    it('should throw not found exception if category does not exist', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      const result = await service.update(1, { name: 'Electronics' });

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'Category not found');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw conflict exception if category name already exists', async () => {
      const category = { id: 1, name: 'Electronics' };
      const existingCategory = { id: 2, name: 'Electronics' };
      mockCategoryRepository.findOne.mockResolvedValueOnce(category);
      mockCategoryRepository.findOne.mockResolvedValueOnce(existingCategory);

      const result = await service.update(1, { name: 'Electronics' });

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'Category with this name already exists');
      expect(result).toHaveProperty('status', HttpStatus.CONFLICT);
    });

    it('should throw internal server error if an error occurs', async () => {
      mockCategoryRepository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await service.update(1, { name: 'Electronics' });

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });


  describe('remove', () => {
    it('should remove a category successfully', async () => {
      const category = { id: 1, name: 'Electronics', product: [] };
      mockCategoryRepository.findOne.mockResolvedValue(category);
      mockCategoryRepository.remove.mockResolvedValue(category);

      const result = await service.remove(1);

      expect(result).toEqual(category);
      expect(mockCategoryRepository.remove).toHaveBeenCalledWith(category);
    });

    it('should throw not found exception if category does not exist', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      const result = await service.remove(1);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'Category not found');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw bad request exception if category has products associated', async () => {
      const category = { id: 1, name: 'Electronics', product: [{ id: 1, name: 'Product1' }] };
      mockCategoryRepository.findOne.mockResolvedValue(category);

      const result = await service.remove(1);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'There are products associated with this category. Please delete the products first.');
      expect(result).toHaveProperty('status', HttpStatus.BAD_REQUEST);
    });

    it('should throw internal server error if an error occurs', async () => {
      mockCategoryRepository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await service.remove(1);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
