import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from 'src/auth/auth.guard';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';




describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;


  const mockCategory:CreateCategoryDto = {
      name:"autos",
      description:"productos sobre autos"
  };

  // jest.fn es una función proporcionada por la biblioteca de pruebas Jest, que se utiliza para crear funciones simuladas (mock functions).

  const mockCategoryService = {
    findAll: jest.fn(() => [{ id: 1, ...mockCategory }]),

    findOne: jest.fn((id: number) => ({ id, ...mockCategory })),

    create: jest.fn((dto: CreateCategoryDto) => ({ id: 1, ...dto })),

    update: jest.fn((id: number, dto: UpdateCategoryDto) => ({ id, ...dto })),

    remove: jest.fn((id: number) => ({ id, ...mockCategory })),

  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          // proporciona una implementación simulada del servicio de users
          provide: CategoryService,
          useValue: mockCategoryService,
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
    controller = module.get<CategoryController>(CategoryController);
    // obtiene una instancia del servicio de usuarios a partir del módulo de prueba compilado
    service = module.get<CategoryService>(CategoryService);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(controller.create).toBeDefined();
    });
  
    it('should create a Category', async () => {
      const createCategoryDto: CreateCategoryDto = mockCategory;
      const result = await controller.create(createCategoryDto);
      expect(result).toEqual({id: 1,...createCategoryDto});
      expect(service.create).toHaveBeenCalledWith(createCategoryDto);
    });
  });

  describe('findAll', () => {
    it('should be defined', () => {
      expect(controller.findAll).toBeDefined();
    });

    it('should return an array of Category', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([{ id: 1, ...mockCategory}]);
      expect(service.findAll).toHaveBeenCalled();
    });


  });


  describe('findOne', () => {
    it('should be defined', () => {
      expect(controller.findOne).toBeDefined();
    });

    it('should return a Category', async () => {
      const id = '1';
      const result = await controller.findOne(id);
      expect(result).toEqual({id: 1, ...mockCategory });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });



  describe('update', () => {
    it('should be defined', () => {
      expect(controller.update).toBeDefined();
    });

    it('should update a Category', async () => {
      const id = '1';
      const updateCategoryDto: UpdateCategoryDto = { description: 'description update' };
      const result = await controller.update(id, updateCategoryDto);
      expect(result).toEqual({ id: 1, ...updateCategoryDto });
      expect(service.update).toHaveBeenCalledWith(1, updateCategoryDto);
    });
  });

  describe('remove', () => {
    it('should be defined', () => {
      expect(controller.remove).toBeDefined();
    });

    it('should remove a Category', async () => {
      const id = '1';
      const result = await controller.remove(id);
      expect(result).toEqual({ id: 1, ...mockCategory});
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

});