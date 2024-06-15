import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from 'src/auth/auth.guard';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductCondition } from './entities/product.entity';
import { UpdateProductDto } from './dto/update-product.dto';



describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;


  const mockProduct: CreateProductDto = {
    product_name: "product test",
    price: 123.45,
    stock: 20,
    description: "description test",
    condition: ProductCondition.NEW,
    category_id: 1,
    user_id: 1
  };

  // jest.fn es una función proporcionada por la biblioteca de pruebas Jest, que se utiliza para crear funciones simuladas (mock functions).

  const mockProductsService = {
    createProduct: jest.fn((dto: CreateProductDto) => ({ id: 1, ...dto })),

    findAllProduct: jest.fn(() => [{ id: 1, ...mockProduct }]),

    findOne: jest.fn((id: number) => ({ id, ...mockProduct })),

    findAllByUserId: jest.fn((user_id: number) => [{ id: 1, user_id, ...mockProduct }]),

    updateProduct: jest.fn((id: number, dto: UpdateProductDto) => ({ id, ...dto })),

    removeProduct: jest.fn((id: number) => ({ id, ...mockProduct })),

    getProductImages: jest.fn((id: number) => ({ id, urlImage: ["http://image.url", "http://image.url"] })),

    uploadProductImage: jest.fn((id: number, file: any) => ({ id, urlImage: "http://image.url" })),

    deleteProductImages: jest.fn((id: number) => ({ id: 1, message: "Product images were successfully removed"})),

  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          // proporciona una implementación simulada del servicio de users
          provide: ProductsService,
          useValue: mockProductsService,
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
    controller = module.get<ProductsController>(ProductsController);
    // obtiene una instancia del servicio de usuarios a partir del módulo de prueba compilado
    service = module.get<ProductsService>(ProductsService);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(controller.create).toBeDefined();
    });

    it('should create a Product', async () => {
      const createProductDto: CreateProductDto = mockProduct;
      const result = await controller.create(createProductDto);
      expect(result).toEqual({ id: 1, ...createProductDto });
      expect(service.createProduct).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('findAll', () => {
    it('should be defined', () => {
      expect(controller.findAllProduct).toBeDefined();
    });

    it('should return an array of Products', async () => {
      const result = await controller.findAllProduct();
      expect(result).toEqual([{ id: 1, ...mockProduct }]);
      expect(service.findAllProduct).toHaveBeenCalled();
    });


    it('should return an array of Products for UserId', async () => {
      const user_id = 1;
      const result = await controller.findAllProduct(user_id);
      expect(result).toEqual([{ id: 1, user_id: 1, ...mockProduct }]);
      expect(service.findAllByUserId).toHaveBeenCalledWith(1);
    });

  });


  describe('findOne', () => {
    it('should be defined', () => {
      expect(controller.findOne).toBeDefined();
    });

    it('should return a Product', async () => {
      const id = 1;
      const result = await controller.findOne(id);
      expect(result).toEqual({ id: 1, ...mockProduct });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });


  
  describe('update', () => {
    it('should be defined', () => {
      expect(controller.updateProduct).toBeDefined();
    });

    it('should update a Product', async () => {
      const id = 1;
      const updateProductDto: UpdateProductDto = { product_name: 'product name update' };
      const result = await controller.updateProduct(id, updateProductDto);
      expect(result).toEqual({ id: 1, ...updateProductDto });
      expect(service.updateProduct).toHaveBeenCalledWith(1, updateProductDto);
    });
  });

  describe('remove', () => {
    it('should be defined', () => {
      expect(controller.removeProduct).toBeDefined();
    });

    it('should remove a Product', async () => {
      const id = 1;
      const result = await controller.removeProduct(id);
      expect(result).toEqual({ id: 1, ...mockProduct });
      expect(service.removeProduct).toHaveBeenCalledWith(1);
    });
  });


  describe('getProductImages', () => {
    it('should be defined', () => {
      expect(controller.getProductImages).toBeDefined();
    });

    it('should return the images of the product', async () => {
      const id = "1";
      const result = await controller.getProductImages(id);
      expect(result).toEqual({ id: 1, urlImage: ["http://image.url", "http://image.url"]});
      expect(service.getProductImages).toHaveBeenCalledWith(1);
    });
  });

  describe('uploadProductImage', () => {
    it('should be defined', () => {
      expect(controller.uploadProductImage).toBeDefined();
    });

    it('should upload an image of the product and return the Url', async () => {
      const id = '1';
      // archivo de imagen simulado:
      const file = { buffer: Buffer.from('test') };
      const result = await controller.uploadProductImage(id, file);
      expect(result).toEqual({ id: 1, urlImage: 'http://image.url' });
      expect(service.uploadProductImage).toHaveBeenCalledWith(1, file);
    });
  });

  describe('deleteProductImages', () => {
    it('should be defined', () => {
      expect(controller.deleteProductImages).toBeDefined();
    });

    it('should delete the product images and return a message', async () => {
      const id = '1';
      const result = await controller.deleteProductImages(id);
      expect(result).toEqual({ id: 1, message: "Product images were successfully removed"});
      expect(service.deleteProductImages).toHaveBeenCalledWith(1);
    });
  });

});