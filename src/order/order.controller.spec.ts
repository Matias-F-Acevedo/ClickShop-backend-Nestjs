import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from 'src/auth/auth.guard';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from './entities/order.entity';



describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;


  const mockOrder:CreateOrderDto = {
      user_id:1,
      shippingAddress: "av libertad 255",
      city: "benito juarez",
      province:"bs as",
      postalCode:"7020",
      country: "argentina",
      status:OrderStatus.PENDING,
      total:34234324
  };

  // jest.fn es una función proporcionada por la biblioteca de pruebas Jest, que se utiliza para crear funciones simuladas (mock functions).

  const mockOrderService = {
    create: jest.fn((dto: CreateOrderDto) => ({ order_id: 1, ...dto })),

    findAll: jest.fn((user_id?: number) => [{ order_id: 1, ...mockOrder }]),

    findAllByUserId: jest.fn((user_id: number) => [{ order_id: 1, ...mockOrder }]),

    findOne: jest.fn((id: number) => ({ id, ...mockOrder })),

    getOrdersForProductOwnerById: jest.fn((OwnerId: number) => ([{ OwnerId, ...mockOrder }])),

    update: jest.fn((id: number, dto: UpdateOrderDto) => ({ id, ...dto })),

    remove: jest.fn((id: number) => ({ id, ...mockOrder })),

  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          // proporciona una implementación simulada del servicio de users
          provide: OrderService,
          useValue: mockOrderService,
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
    controller = module.get<OrderController>(OrderController);
    // obtiene una instancia del servicio de usuarios a partir del módulo de prueba compilado
    service = module.get<OrderService>(OrderService);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(controller.create).toBeDefined();
    });
  
    it('should create a Order', async () => {
      const createOrderDto: CreateOrderDto = mockOrder;
      const result = await controller.create(createOrderDto);
      expect(result).toEqual({order_id: 1,...createOrderDto});
      expect(service.create).toHaveBeenCalledWith(createOrderDto);
    });
  });

  describe('findAll', () => {
    it('should be defined', () => {
      expect(controller.findAll).toBeDefined();
    });

    it('should return an array of Orders', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([{ order_id: 1, ...mockOrder}]);
      expect(service.findAll).toHaveBeenCalled();
    });


    it('should return an array of Orders for UserId', async () => {
      const user_id = 1;
      const result = await controller.findAll(user_id);
      expect(result).toEqual([{ user_id: 1, order_id:1,...mockOrder}]);
      expect(service.findAll).toHaveBeenCalled();
    });

  });


  describe('findOne', () => {
    it('should be defined', () => {
      expect(controller.findOne).toBeDefined();
    });

    it('should return a Order', async () => {
      const order_id = '1';
      const result = await controller.findOne(order_id);
      expect(result).toEqual({id: 1, ...mockOrder });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });


  describe('getOrdersForProductOwnerById', () => {
    it('should be defined', () => {
      expect(controller.getOrdersForProductOwnerById).toBeDefined();
    });

    it('should return an array of Orders for Product Owner by id', async () => {
      const OwnerId = '1';
      const result = await controller.getOrdersForProductOwnerById(OwnerId);
      expect(result).toEqual([{OwnerId: 1, ...mockOrder}]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });


  describe('update', () => {
    it('should be defined', () => {
      expect(controller.update).toBeDefined();
    });

    it('should update a Order', async () => {
      const id = '1';
      const updateOrderDto: UpdateOrderDto = { province: 'Cordoba' };
      const result = await controller.update(id, updateOrderDto);
      expect(result).toEqual({ id: 1, ...updateOrderDto });
      expect(service.update).toHaveBeenCalledWith(1, updateOrderDto);
    });
  });

  describe('remove', () => {
    it('should be defined', () => {
      expect(controller.remove).toBeDefined();
    });

    it('should remove a Order', async () => {
      const id = '1';
      const result = await controller.remove(id);
      expect(result).toEqual({ id: 1, ...mockOrder});
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });




  
});