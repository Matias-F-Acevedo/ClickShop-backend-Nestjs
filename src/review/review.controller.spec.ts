import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthGuard } from 'src/auth/auth.guard';

describe('ReviewController', () => {
  let controller: ReviewController;
  let service: ReviewService;

  const mockReview: CreateReviewDto = {
    product_id: 1,
    user_id: 1,
    score: 5,
    commentary: "muy bueno el producto"
  };

  // jest.fn es una función proporcionada por la biblioteca de pruebas Jest, que se utiliza para crear funciones simuladas (mock functions).

  const mockReviewService = {
    create: jest.fn((dto: CreateReviewDto) => ({ review_id: 1, ...dto })),

    findAll: jest.fn(() => [{ review_id: 1, ...mockReview }]),

    findAllByProductId: jest.fn((productId?: number) => [{ product_id:productId,review_id: 1, ...mockReview }]),

    findOne: jest.fn((id: number) => ({ id, ...mockReview })),

    update: jest.fn((id: number, dto: UpdateReviewDto) => ({ id, ...dto })),

    remove: jest.fn((id: number) => ({ id, ...mockReview })),

  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [
        {
          // proporciona una implementación simulada del servicio de users
          provide: ReviewService,
          useValue: mockReviewService,
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
    controller = module.get<ReviewController>(ReviewController);
    // obtiene una instancia del servicio de usuarios a partir del módulo de prueba compilado
    service = module.get<ReviewService>(ReviewService);
  });



  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(controller.create).toBeDefined();
    });

    it('should create a review', async () => {
      const createReviewDto: CreateReviewDto = mockReview;
      const result = await controller.create(createReviewDto);
      expect(result).toEqual({ review_id: 1, ...createReviewDto });
      expect(service.create).toHaveBeenCalledWith(createReviewDto);
    });
  });

  describe('findAll', () => {
    it('should be defined', () => {
      expect(controller.findAll).toBeDefined();
    });

    it('should return an array of review', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([{ review_id: 1, ...mockReview }]);
      expect(service.findAll).toHaveBeenCalled();
    });


    it('should return an array of review for productId', async () => {
      const productId = 1;
      const result = await controller.findAll(productId);
      expect(result).toEqual([{ product_id: 1, review_id: 1, ...mockReview }]);
      expect(service.findAll).toHaveBeenCalled();
    });

  });


  describe('findOne', () => {
    it('should be defined', () => {
      expect(controller.findOne).toBeDefined();
    });

    it('should return a Review', async () => {
      const review_id = '1';
      const result = await controller.findOne(review_id);
      expect(result).toEqual({ id: 1, ...mockReview });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });



  describe('update', () => {
    it('should be defined', () => {
      expect(controller.update).toBeDefined();
    });

    it('should update a Review', async () => {
      const id = '1';
      const updateReviewDto: UpdateReviewDto = { commentary: 'muy mala calidad' };
      const result = await controller.update(id, updateReviewDto);
      expect(result).toEqual({ id: 1, ...updateReviewDto });
      expect(service.update).toHaveBeenCalledWith(1, updateReviewDto);
    });
  });

  describe('remove', () => {
    it('should be defined', () => {
      expect(controller.remove).toBeDefined();
    });

    it('should remove a Review', async () => {
      const id = '1';
      const result = await controller.remove(id);
      expect(result).toEqual({ id: 1, ...mockReview });
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });



});
