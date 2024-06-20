import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from 'src/auth/auth.guard';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';




describe('FavoritesController', () => {
  let controller: FavoritesController;
  let service: FavoritesService;


  const mockFavorite:CreateFavoriteDto = {
    product_id: 1,
    user_id:1
  };

  // jest.fn es una función proporcionada por la biblioteca de pruebas Jest, que se utiliza para crear funciones simuladas (mock functions).

  const mockFavoriteService = {

    findAllFavorites: jest.fn((user_id: number) => [{ favorite_id: 1 ,user_id, ...mockFavorite }]),

    addFavorite: jest.fn((dto: CreateFavoriteDto) => ({ favorite_id: 1, ...dto })),

    removeFavorite: jest.fn((user_id: number, product_id: string ) => ({user_id,product_id, ...mockFavorite})),

  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [
        {
          // proporciona una implementación simulada del servicio de users
          provide: FavoritesService,
          useValue: mockFavoriteService,
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
    controller = module.get<FavoritesController>(FavoritesController);
    // obtiene una instancia del servicio de usuarios a partir del módulo de prueba compilado
    service = module.get<FavoritesService>(FavoritesService);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(controller.create).toBeDefined();
    });
  
    it('should create a Favorite', async () => {
      const createFavoriteDto: CreateFavoriteDto = mockFavorite;
      const result = await controller.create(createFavoriteDto);
      expect(result).toEqual({favorite_id: 1,...createFavoriteDto});
      expect(service.addFavorite).toHaveBeenCalledWith(createFavoriteDto);
    });
  });

  describe('findAll', () => {
    it('should be defined', () => {
      expect(controller.findAll).toBeDefined();
    });

    it('should return an array of favorites for UserId', async () => {
      const userId = "1"
      const result = await controller.findAll(userId);
      expect(result).toEqual([{ favorite_id: 1, user_id: userId,...mockFavorite}]);
      expect(service.findAllFavorites).toHaveBeenCalled();
    });

  });


  describe('remove', () => {
    it('should be defined', () => {
      expect(controller.remove).toBeDefined();
    });

    it('should remove a Favorite', async () => {
      const user_id = '1';
      const product_id ="2"
      const result = await controller.remove(user_id,product_id);
      expect(result).toEqual({user_id,product_id, ...mockFavorite});
      expect(service.removeFavorite).toHaveBeenCalledWith(1,2);
    });
  });

});