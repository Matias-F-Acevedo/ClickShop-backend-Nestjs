import { Test, TestingModule } from '@nestjs/testing';
import { OrderDetailsController } from './order-details.controller';
import { OrderDetailsService } from './order-details.service';
import { CreateOrderDetailDto } from './dto/create-order-detail.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateOrderDetailDto } from './dto/update-order-detail.dto';

describe('OrderDetailsController', () => {
  let controller: OrderDetailsController;
  let service: OrderDetailsService;


  const mockOrderDetails: CreateOrderDetailDto = {
      order_id:1,
      product_id:1,
      quantity:30,
      unitPrice:23.5
  };
  // jest.fn es una función proporcionada por la biblioteca de pruebas Jest, que se utiliza para crear funciones simuladas (mock functions).
  const mockOrderDetailsService = {
    create: jest.fn((dto:CreateOrderDetailDto) => ({id: 1, ...dto })),

    findAll: jest.fn(() => [{ id: 1, ...mockOrderDetails }]),

    findOne: jest.fn((id: number) => ({ id, ...mockOrderDetails })),

    update: jest.fn((id: number, dto: UpdateOrderDetailDto) => ({ id, ...dto })),

    remove: jest.fn((id: number) => ({ id, ...mockOrderDetails })),

  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderDetailsController],
      providers: [
        {
          // proporciona una implementación simulada del servicio de users
          provide: OrderDetailsService,
          useValue: mockOrderDetailsService,
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
    controller = module.get<OrderDetailsController>(OrderDetailsController);
    // obtiene una instancia del servicio de usuarios a partir del módulo de prueba compilado
    service = module.get<OrderDetailsService>(OrderDetailsService);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(controller.create).toBeDefined();
    });
  
    it('should create a OrderDetail', async () => {
      const createOrderDetailDto: CreateOrderDetailDto = mockOrderDetails;
      const result = await controller.create(createOrderDetailDto);
      expect(result).toEqual({id: 1,...createOrderDetailDto});
      expect(service.create).toHaveBeenCalledWith(createOrderDetailDto);
    });
  });

  describe('findAll', () => {
    it('should be defined', () => {
      expect(controller.findAll).toBeDefined();
    });

    it('should return an array of OrdersDetail', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([{id: 1, ...mockOrderDetails}]);
      expect(service.findAll).toHaveBeenCalled();
    });

  });


  describe('findOne', () => {
    it('should be defined', () => {
      expect(controller.findOne).toBeDefined();
    });

    it('should return a OrderDetail', async () => {
      const id = '1';
      const result = await controller.findOne(id);
      expect(result).toEqual({id: 1, ...mockOrderDetails });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });



  describe('update', () => {
    it('should be defined', () => {
      expect(controller.update).toBeDefined();
    });

    it('should update a OrderDetail', async () => {
      const id = '1';
      const updateOrderDetailDto: UpdateOrderDetailDto = { quantity:2 };
      const result = await controller.update(id, updateOrderDetailDto);
      expect(result).toEqual({ id: 1, ...updateOrderDetailDto });
      expect(service.update).toHaveBeenCalledWith(1, updateOrderDetailDto);
    });
  });

  describe('remove', () => {
    it('should be defined', () => {
      expect(controller.remove).toBeDefined();
    });

    it('should remove a OrderDetail', async () => {
      const id = '1';
      const result = await controller.remove(id);
      expect(result).toEqual({ id: 1, ...mockOrderDetails});
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });



});
