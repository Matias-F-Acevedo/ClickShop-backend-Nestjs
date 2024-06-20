import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductCondition, Products } from './entities/product.entity';
import { CategoryService } from 'src/category/category.service';
import { UsersService } from 'src/users/users.service';
import { ImagesService } from 'src/images/images.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const mockProductRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

const mockCategoryService = {
  findOne: jest.fn(),
};

const mockUserService = {
  findOne: jest.fn(),
};

const mockImagesService = {
  getPublicUrl: jest.fn(),
  listFilesInFolder: jest.fn(),
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
};


const mockProduct: CreateProductDto = {
  product_name: "Test product",
  price: 123.23,
  stock: 20,
  description: "descriptionTest",
  condition: ProductCondition.NEW,
  category_id: 1,
  user_id: 1
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Products), useValue: mockProductRepository },
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: UsersService, useValue: mockUserService },
        { provide: ImagesService, useValue: mockImagesService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    const createProductDto: CreateProductDto = mockProduct;

    it('should create and return the product successfully', async () => {
      mockCategoryService.findOne.mockResolvedValue({});
      mockUserService.findOne.mockResolvedValue({});
      const savedProduct = { productId: 1, ...createProductDto, isActive: true };
      mockProductRepository.create.mockReturnValue(savedProduct);
      mockProductRepository.save.mockResolvedValue(savedProduct);

      const result = await service.createProduct(createProductDto);

      expect(result).toEqual(savedProduct);
      expect(mockCategoryService.findOne).toHaveBeenCalledWith(createProductDto.category_id);
      expect(mockUserService.findOne).toHaveBeenCalledWith(createProductDto.user_id);
      expect(mockProductRepository.create).toHaveBeenCalledWith(createProductDto);
      expect(mockProductRepository.save).toHaveBeenCalledWith(savedProduct);
    });

    it('should throw not found exception if category is not found', async () => {
      mockCategoryService.findOne.mockResolvedValue(new HttpException('Category not found', HttpStatus.NOT_FOUND));

      const result = await service.createProduct(createProductDto);

      expect(mockCategoryService.findOne).toHaveBeenCalledWith(createProductDto.category_id);
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'Category not found');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw not found exception if user is not found', async () => {
      mockCategoryService.findOne.mockResolvedValue({});
      mockUserService.findOne.mockResolvedValue(new HttpException('User not found', HttpStatus.NOT_FOUND));

      const result = await service.createProduct(createProductDto);

      expect(mockUserService.findOne).toHaveBeenCalledWith(createProductDto.user_id);
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'User not found');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw internal server error if an error occurs', async () => {
      mockCategoryService.findOne.mockRejectedValue(new Error('Database connection error'));

      const result = await service.createProduct(createProductDto);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('findAllProduct', () => {
    it('should return a list of products successfully', async () => {
      const products = [{ productId: 1, isActive: true }];
      mockProductRepository.find.mockResolvedValue(products);
      mockImagesService.getPublicUrl.mockResolvedValue('url');

      const result = await service.findAllProduct();

      expect(result).toEqual(products);
      expect(mockProductRepository.find).toHaveBeenCalledWith({ where: { isActive: true } });
    });

    it('should throw internal server error if an error occurs', async () => {
      mockProductRepository.find.mockRejectedValue(new Error('Database connection error'));

      const result = await service.findAllProduct();

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('findOne', () => {
    it('should return a product successfully', async () => {
      const product = { productId: 1, isActive: true };
      mockProductRepository.findOne.mockResolvedValue(product);
      mockImagesService.getPublicUrl.mockResolvedValue('url');

      const result = await service.findOne(1);

      expect(result).toEqual(product);
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({ where: { productId: 1, isActive: true } });
    });

    it('should throw not found exception if product does not exist', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(1);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'The product does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw internal server error if an error occurs', async () => {
      mockProductRepository.findOne.mockRejectedValue(new Error('Database connection error'));

      const result = await service.findOne(1);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('findAllByUserId', () => {
    it('should return a list of products by user successfully', async () => {
      const products = [{ productId: 1, isActive: true, user_id: 1 }];
      mockProductRepository.find.mockResolvedValue(products);
      mockImagesService.getPublicUrl.mockResolvedValue('url');

      const result = await service.findAllByUserId(1);

      expect(result).toEqual(products);
      expect(mockProductRepository.find).toHaveBeenCalledWith({ where: { isActive: true, user_id: 1 } });
    });

    it('should throw internal server error if an error occurs', async () => {
      mockProductRepository.find.mockRejectedValue(new Error('Database connection error'));

      const result = await service.findAllByUserId(1);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('updateProduct', () => {
    const updateProductDto: UpdateProductDto = {
      product_name: "test update"
    };

    it('should update and return the product successfully', async () => {
      const product = { productId: 1, isActive: true };
      mockProductRepository.findOne.mockResolvedValue(product);

      const result = await service.updateProduct(1, updateProductDto);

      expect(result).toEqual({ ...product, ...updateProductDto });
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({ where: { productId: 1, isActive: true } });
    });

    it('should throw not found exception if product does not exist', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      const result = await service.updateProduct(1, updateProductDto);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'The product does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw not found exception if category is not found', async () => {
      const product = { productId: 1, isActive: true };
      mockProductRepository.findOne.mockResolvedValue(product);
      mockCategoryService.findOne.mockResolvedValue(new HttpException('Category not found', HttpStatus.NOT_FOUND));

      const result = await service.updateProduct(1, { category_id: 13 });

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'Category not found');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw internal server error if an error occurs', async () => {
      mockProductRepository.findOne.mockRejectedValue(new Error('Database connection error'));

      const result = await service.updateProduct(1, updateProductDto);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });



  describe('removeProduct', () => {
    it('should remove and return the product successfully', async () => {
      const product = { productId: 1, isActive: true, product_image: 'some/path' };
      mockProductRepository.findOne.mockResolvedValue(product);
      mockProductRepository.save.mockResolvedValue({ ...product, isActive: false, product_image: 'default-image-product/default-image-product.jpeg' });

      const result = await service.removeProduct(1);

      expect(result).toEqual({ ...product });

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({ where: { productId: 1, isActive: true } });

      expect(mockProductRepository.save).toHaveBeenCalledWith({ ...product });
    });

    it('should throw not found exception if product does not exist', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      const result = await service.removeProduct(1);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'The product does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw internal server error if an error occurs', async () => {
      mockProductRepository.findOne.mockRejectedValue(new Error('Database connection error'));

      const result = await service.removeProduct(1);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('getProductImages', () => {
    it('should return product images successfully', async () => {
      const product = { productId: 1, isActive: true, product_image: 'some/path' };
      const images = ['image1.jpg', 'image2.jpg'];
      const urls = ['url1', 'url2'];
      mockProductRepository.findOne.mockResolvedValue(product);
      mockImagesService.listFilesInFolder.mockResolvedValue(images);
      mockImagesService.getPublicUrl.mockResolvedValueOnce('url1').mockResolvedValueOnce('url2');

      const result = await service.getProductImages(1);

      expect(result).toEqual({ productId: 1, urlImage: urls });
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({ where: { productId: 1, isActive: true } });
      expect(mockImagesService.listFilesInFolder).toHaveBeenCalledWith('some/path');
    });

    it('should throw not found exception if product does not exist', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      const result = await service.getProductImages(1);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'The product does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw not found exception if no images are found', async () => {
      const product = { productId: 1, isActive: true, product_image: 'some/path' };
      mockProductRepository.findOne.mockResolvedValue(product);
      mockImagesService.listFilesInFolder.mockResolvedValue([]);

      const result = await service.getProductImages(1);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'This product has no images stored');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw internal server error if an error occurs', async () => {
      mockProductRepository.findOne.mockRejectedValue(new Error('Database connection error'));

      const result = await service.getProductImages(1);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('uploadProductImage', () => {
    it('should upload and return the product image successfully', async () => {
      const product = { productId: 1, isActive: true, product_image: 'products-images/product-1' };
      const file = {};
      const images = ['image1.jpg', 'image2.jpg'];
      mockProductRepository.findOne.mockResolvedValue(product);
      mockImagesService.listFilesInFolder.mockResolvedValue(images);
      mockImagesService.getPublicUrl.mockResolvedValue('url3');
  
      const result = await service.uploadProductImage(1, file);
  
      expect(result).toEqual({ productId: 1, urlImage: 'url3' });
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({ where: { productId: 1, isActive: true } });
    });
  
    it('should throw not found exception if product does not exist', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);
  
      const result = await service.uploadProductImage(1, {});
  
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'The product does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });
  
    it('should throw conflict exception if maximum images limit is reached', async () => {
      const product = { productId: 1, isActive: true, product_image: 'some/path' };
      const file = {};
      const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
      mockProductRepository.findOne.mockResolvedValue(product);
      mockImagesService.listFilesInFolder.mockResolvedValue(images);
  
      const result = await service.uploadProductImage(1, file);
  
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'Only three images per product can be uploaded');
      expect(result).toHaveProperty('status', HttpStatus.CONFLICT);
    });
  
    it('should throw internal server error if an error occurs', async () => {
      mockProductRepository.findOne.mockRejectedValue(new Error('Database connection error'));
  
      const result = await service.uploadProductImage(1, {});
  
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('deleteProductImages', () => {
    it('should delete product images successfully', async () => {
      const product = { productId: 1, isActive: true, product_image: 'some/path' };
      const images = ['image1.jpg', 'image2.jpg'];
      mockProductRepository.findOne.mockResolvedValue(product);
      mockImagesService.listFilesInFolder.mockResolvedValue(images);
  
      const result = await service.deleteProductImages(1);
  
      expect(result).toEqual({ productId: 1, message: 'Product images were successfully removed' });
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({ where: { productId: 1, isActive: true } });
      expect(mockImagesService.deleteImage).toHaveBeenCalledTimes(images.length);
    });
  
    it('should throw not found exception if product does not exist', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);
  
      const result = await service.deleteProductImages(1);
  
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'The product does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });
  
    it('should throw not found exception if no images are found', async () => {
      const product = { productId: 1, isActive: true, product_image: 'some/path' };
      mockProductRepository.findOne.mockResolvedValue(product);
      mockImagesService.listFilesInFolder.mockResolvedValue([]);
  
      const result = await service.deleteProductImages(1);
  
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'This product has no images stored');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });
  
    it('should throw internal server error if an error occurs', async () => {
      mockProductRepository.findOne.mockRejectedValue(new Error('Database connection error'));
  
      const result = await service.deleteProductImages(1);
  
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
