import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

describe('ReviewService', () => {
  let service: ReviewService;
  let mockReviewRepository;
  let mockUsersService;
  let mockProductsService;

  beforeEach(async () => {
    mockReviewRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
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
        ReviewService,
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
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

    service = module.get<ReviewService>(ReviewService);
  });


  describe('create', () => {
    it('should create a review successfully', async () => {
      const createReviewDto: CreateReviewDto = { user_id: 1, product_id: 1, score: 5, commentary: 'Great product!' };
      const review = { id: 1, ...createReviewDto };

      mockUsersService.findOne.mockResolvedValue({});
      mockProductsService.findOne.mockResolvedValue({});
      mockReviewRepository.findOne.mockResolvedValue(null);
      mockReviewRepository.create.mockReturnValue(review);
      mockReviewRepository.save.mockResolvedValue(review);

      const result = await service.create(createReviewDto);

      expect(result).toEqual(review);
    });

    it('should throw not found exception if user does not exist', async () => {
      const createReviewDto: CreateReviewDto = { user_id: 1, product_id: 1, score: 5, commentary: 'Great product!' };
      mockUsersService.findOne.mockResolvedValue(new HttpException('User not found', HttpStatus.NOT_FOUND));

      const result = await service.create(createReviewDto);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'The user does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw not found exception if product does not exist', async () => {
      const createReviewDto: CreateReviewDto = { user_id: 1, product_id: 1, score: 5, commentary: 'Great product!' };
      mockUsersService.findOne.mockResolvedValue({});
      mockProductsService.findOne.mockResolvedValue(new HttpException('Product not found', HttpStatus.NOT_FOUND));

      const result = await service.create(createReviewDto);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'The product does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw conflict exception if review already exists', async () => {
      const createReviewDto: CreateReviewDto = { user_id: 1, product_id: 1, score: 5, commentary: 'Great product!' };
      mockUsersService.findOne.mockResolvedValue({});
      mockProductsService.findOne.mockResolvedValue({});
      mockReviewRepository.findOne.mockResolvedValue(createReviewDto);

      const result = await service.create(createReviewDto);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'There is already a registered user review to the product, update the existing record.');
      expect(result).toHaveProperty('status', HttpStatus.CONFLICT);
    });

    it('should throw internal server error if an error occurs', async () => {
      const createReviewDto: CreateReviewDto = { user_id: 1, product_id: 1, score: 5, commentary: 'Great product!' };
      mockUsersService.findOne.mockRejectedValue(new Error('Database error'));

      const result = await service.create(createReviewDto);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('findAll', () => {
    it('should find all reviews successfully', async () => {
      const reviews = [
        { id: 1, user_id: 1, product_id: 1, score: 4, commentary: 'Nice product' },
        { id: 2, user_id: 2, product_id: 1, score: 5, commentary: 'Awesome!' },
      ];

      mockReviewRepository.find.mockResolvedValue(reviews);

      const result = await service.findAll();

      expect(result).toEqual(reviews);
    });

    it('should throw internal server error if an error occurs', async () => {
      mockReviewRepository.find.mockRejectedValue(new Error('Database error'));

      const result = await service.findAll();

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });


  describe('findAllByProductId', () => {
    it('should find all reviews for a product successfully', async () => {
      const productId = 1;
      const reviews = [
        { id: 1, user_id: 1, product_id: productId, score: 4, commentary: 'Nice product' },
        { id: 2, user_id: 2, product_id: productId, score: 5, commentary: 'Awesome!' },
      ];
      const user1 = { user_name: 'John', user_lastname: 'Doe', user_image: 'image1' };
      const user2 = { user_name: 'Jane', user_lastname: 'Smith', user_image: 'image2' };

      mockReviewRepository.find.mockResolvedValue(reviews);
      mockUsersService.findOne.mockResolvedValueOnce(user1).mockResolvedValueOnce(user2);

      const result = await service.findAllByProductId(productId);

      expect(result).toEqual([
        { ...reviews[0], user: { ...user1 } },
        { ...reviews[1], user: { ...user2 } },
      ]);
    });

    it('should handle users that return HttpException', async () => {
      const productId = 1;
      const reviews = [{ id: 1, user_id: 1, product_id: productId, score: 4, commentary: 'Nice product' }];
      mockReviewRepository.find.mockResolvedValue(reviews);
      mockUsersService.findOne.mockResolvedValue(new HttpException('User not found', HttpStatus.NOT_FOUND));

      const result = await service.findAllByProductId(productId);

      expect(result).toEqual(reviews);
    });

    it('should throw internal server error if an error occurs', async () => {
      const productId = 1;
      mockReviewRepository.find.mockRejectedValue(new Error('Database error'));

      const result = await service.findAllByProductId(productId);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'INTERNAL SERVER ERROR');
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });


  describe('findOne', () => {
    it('should find a review by id successfully', async () => {
      const reviewId = 1;
      const review = { id: reviewId, user_id: 1, product_id: 1, score: 4, commentary: 'Nice product' };

      mockReviewRepository.findOne.mockResolvedValue(review);

      const result = await service.findOne(reviewId);

      expect(result).toEqual(review);
    });

    it('should throw not found exception if review does not exist', async () => {
      const reviewId = 1;
      mockReviewRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(reviewId);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'Review does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw bad request exception if an error occurs', async () => {
      const reviewId = 1;
      mockReviewRepository.findOne.mockRejectedValue(new Error('Invalid ID'));

      const result = await service.findOne(reviewId);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'The provided ID parameter is invalid');
      expect(result).toHaveProperty('status', HttpStatus.BAD_REQUEST);
    });
  });


  describe('update', () => {
    it('should update a review successfully', async () => {
      const reviewId = 1;
      const updateReviewDto: UpdateReviewDto = { score: 5, commentary: 'Excellent product!' };
      const existingReview = { id: reviewId, user_id: 1, product_id: 1, score: 4, commentary: 'Nice product' };
      const updatedReview = { ...existingReview, ...updateReviewDto };

      mockReviewRepository.findOne.mockResolvedValue(existingReview);
      mockUsersService.findOne.mockResolvedValue({});
      mockProductsService.findOne.mockResolvedValue({});
      mockReviewRepository.update.mockResolvedValue(null);

      const result = await service.update(reviewId, updateReviewDto);

      expect(result).toEqual(updatedReview);
    });

    it('should throw not found exception if review does not exist', async () => {
      const reviewId = 1;
      const updateReviewDto: UpdateReviewDto = { score: 5, commentary: 'Excellent product!' };
      mockReviewRepository.findOne.mockResolvedValue(null);

      const result = await service.update(reviewId, updateReviewDto);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'The Review does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw not found exception if user does not exist', async () => {
      const reviewId = 1;
      const updateReviewDto: UpdateReviewDto = { user_id: 1 };
      mockReviewRepository.findOne.mockResolvedValue({});
      mockUsersService.findOne.mockResolvedValue(new HttpException('User not found', HttpStatus.NOT_FOUND));

      const result = await service.update(reviewId, updateReviewDto);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'The user does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw not found exception if product does not exist', async () => {
      const reviewId = 1;
      const updateReviewDto: UpdateReviewDto = { product_id: 1 };
      mockReviewRepository.findOne.mockResolvedValue({});
      mockProductsService.findOne.mockResolvedValue(new HttpException('Product not found', HttpStatus.NOT_FOUND));

      const result = await service.update(reviewId, updateReviewDto);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'The product does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw bad request exception if an error occurs', async () => {
      const reviewId = 1;
      const updateReviewDto: UpdateReviewDto = { score: 5, commentary: 'Excellent product!' };
      mockReviewRepository.findOne.mockRejectedValue(new Error('Invalid ID'));

      const result = await service.update(reviewId, updateReviewDto);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'The provided ID parameter is invalid');
      expect(result).toHaveProperty('status', HttpStatus.BAD_REQUEST);
    });
  });


  describe('remove', () => {
    it('should remove a review successfully', async () => {
      const reviewId = 1;
      const existingReview = { id: reviewId, user_id: 1, product_id: 1, score: 4, commentary: 'Nice product' };

      mockReviewRepository.findOne.mockResolvedValue(existingReview);
      mockReviewRepository.delete.mockResolvedValue(existingReview);

      const result = await service.remove(reviewId);

      expect(result).toEqual(existingReview);
    });

    it('should throw not found exception if review does not exist', async () => {
      const reviewId = 1;
      mockReviewRepository.findOne.mockResolvedValue(null);

      const result = await service.remove(reviewId);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'The Review does not exist');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should throw bad request exception if an error occurs', async () => {
      const reviewId = 1;
      mockReviewRepository.findOne.mockRejectedValue(new Error('Invalid ID'));

      const result = await service.remove(reviewId);

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'The provided ID parameter is invalid');
      expect(result).toHaveProperty('status', HttpStatus.BAD_REQUEST);
    });
  });
});
