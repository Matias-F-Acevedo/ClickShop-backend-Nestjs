import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { Order, OrderStatus } from './entities/order.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    getMany: jest.fn()
  }))
});

const mockUserService = {
  findOne: jest.fn(),
};


describe('OrderService', () => {
  let service: OrderService;
  let mockOrderRepository: MockRepository;

  beforeEach(async () => {

    mockOrderRepository = createMockRepository();


    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository
        },
        { provide: UsersService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });



  const mockOrder: Partial<Order> = {
    order_id: 1,
    user_id: 1,
    total: 100,
    status: OrderStatus.PENDING,
  };

  const mockCreateOrderDto: CreateOrderDto = {
    user_id: 1,
    shippingAddress: "Av. libertad 255",
    city: "Benito juarez",
    province: "Bs. as.",
    postalCode: "7020",
    country: "Argentina",
    total: 100,
    status: OrderStatus.PENDING,

  };

  const mockUpdateOrderDto: UpdateOrderDto = {
    user_id: 1,
    total: 150,
    status: OrderStatus.COMPLETED,
  };

  describe('create', () => {
    it('should create a new order successfully', async () => {
      mockUserService.findOne.mockResolvedValue({});
      mockOrderRepository.create.mockReturnValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);

      const result = await service.create(mockCreateOrderDto);

      expect(result).toEqual(mockOrder);
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(mockOrderRepository.create).toHaveBeenCalledWith(mockCreateOrderDto);
      expect(mockOrderRepository.save).toHaveBeenCalledWith(mockOrder);
    });

    it('should return NOT_FOUND exception if user does not exist', async () => {
      mockUserService.findOne.mockResolvedValue(new HttpException('User not found', HttpStatus.NOT_FOUND));

      const result = await service.create(mockCreateOrderDto);

      expect(result).toEqual(new HttpException('User not found', HttpStatus.NOT_FOUND));
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(mockOrderRepository.create).not.toHaveBeenCalled();
      expect(mockOrderRepository.save).not.toHaveBeenCalled();
    });

  });

  describe('findAll', () => {
    it('should return all orders successfully', async () => {
      mockOrderRepository.find.mockResolvedValue([mockOrder]);

      const result = await service.findAll();

      expect(result).toEqual([mockOrder]);
      expect(mockOrderRepository.find).toHaveBeenCalledWith({
        relations: ['orderDetail']
      });
    });

    it('should return INTERNAL_SERVER_ERROR on database error', async () => {
      mockOrderRepository.find.mockRejectedValue(new Error('Database error'));

      const result = await service.findAll();

      expect(result).toEqual(new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR));
      expect(mockOrderRepository.find).toHaveBeenCalledWith({
        relations: ['orderDetail']
      });
    });
  });

  describe('findOne', () => {
    it('should return an order successfully', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findOne(1);

      expect(result).toEqual(mockOrder);
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { order_id: 1 }
      });
    });

    it('should return NOT_FOUND exception if order does not exist', async () => {
      mockOrderRepository.findOne.mockResolvedValue(undefined);

      const result = await service.findOne(1);

      expect(result).toEqual(new HttpException('Order does not exist', HttpStatus.NOT_FOUND));
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { order_id: 1 }
      });
    });

    it('should return BAD_REQUEST exception on database error', async () => {
      mockOrderRepository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await service.findOne(1);

      expect(result).toEqual(new HttpException('The provided ID parameter is invalid', HttpStatus.BAD_REQUEST));
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { order_id: 1 }
      });
    });
  });

  describe('findAllByUserId', () => {
    it('should return all orders for a user successfully', async () => {
      mockOrderRepository.find.mockResolvedValue([mockOrder]);

      const result = await service.findAllByUserId(1);

      expect(result).toEqual([mockOrder]);
      expect(mockOrderRepository.find).toHaveBeenCalledWith({
        where: { user_id: 1 },
        relations: ['orderDetail']
      });
    });

    it('should return INTERNAL_SERVER_ERROR on database error', async () => {
      mockOrderRepository.find.mockRejectedValue(new Error('Database error'));

      const result = await service.findAllByUserId(1);

      expect(result).toEqual(new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR));
      expect(mockOrderRepository.find).toHaveBeenCalledWith({
        where: { user_id: 1 },
        relations: ['orderDetail']
      });
    });
  });

  describe('getOrdersForProductOwnerById', () => {
    it('should return formatted orders for a product owner', async () => {
      const productOwnerId = 1;
      const expectedFormattedOrders = [
        {
          id: 1,
          orderDetail: [
            {
              id: 1,
              quantity: 2,
              product: {
                product_name: 'Product 1',
                product_image: 'product1.jpg',
              }
            },
            {
              id: 2,
              quantity: 1,
              product: {
                product_name: 'Product 2',
                product_image: 'product2.jpg',
              }
            }
          ],
          user: {
            user_name: 'John',
            user_lastname: 'Doe',
            user_phoneNumber: '1234567890',
            user_address: '123 Main St',
            user_identificationNumber: 'ABC123',
          }
        },
        {
          id: 2,
          orderDetail: [
            {
              id: 3,
              quantity: 1,
              product: {
                product_name: 'Product 3',
                product_image: 'product3.jpg',
              }
            }
          ],
          user: {
            user_name: 'Jane',
            user_lastname: 'Smith',
            user_phoneNumber: '9876543210',
            user_address: '456 Elm St',
            user_identificationNumber: 'XYZ789',
          }
        }
      ];
      
      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedFormattedOrders),
      };

      jest.spyOn(mockOrderRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const formattedOrders = await service.getOrdersForProductOwnerById(productOwnerId);

      expect(formattedOrders).toEqual(expectedFormattedOrders);

      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledTimes(3);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled(); 
    });

    it('should throw an error if query fails', async () => {
      const productOwnerId = 1;

      jest.spyOn(mockOrderRepository, 'createQueryBuilder').mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      try {
        await service.getOrdersForProductOwnerById(productOwnerId);
        // Fail the test if the above line does not throw an error
        expect(true).toBe(false); // This line should not be reached
      } catch (error) {
        expect(error.message).toBe('Error al obtener las órdenes para el propietario del producto');
      }
    });
  });

  describe('update', () => {
    it('should update an existing order', async () => {
      const orderId = 1;
      const updateOrderDto: UpdateOrderDto = { city:"tandil" };

    
      jest.spyOn(mockOrderRepository, 'findOne').mockResolvedValue({ order_id: orderId });

     
      const updateSpy = jest.spyOn(mockOrderRepository, 'update').mockResolvedValue(undefined);

      const result = await service.update(orderId, updateOrderDto);

      expect(result).toEqual(expect.objectContaining(updateOrderDto));
      expect(updateSpy).toHaveBeenCalledWith(orderId, updateOrderDto);
    });

    it('should return HttpException if order does not exist', async () => {
      const orderId = 1;
      const updateOrderDto: UpdateOrderDto = { city:"tandil" };

      jest.spyOn(mockOrderRepository, 'findOne').mockResolvedValue(null);

      try {
        await service.update(orderId, updateOrderDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('The order does not exist');
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
      }
    });

    it('should return HttpException if user not found', async () => {
      const orderId = 1;
      const updateOrderDto: UpdateOrderDto = { user_id: 999 };

      jest.spyOn(mockOrderRepository, 'findOne').mockResolvedValue({ order_id: orderId });
      jest.spyOn(mockUserService, 'findOne').mockResolvedValue(new HttpException('User not found', HttpStatus.NOT_FOUND));

      try {
        await service.update(orderId, updateOrderDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('User not found');
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should return HttpException on invalid ID parameter', async () => {
      const invalidId = 'invalid_id';
      const updateOrderDto: UpdateOrderDto = { city:"tandil" };

      try {
        await service.update(invalidId as any, updateOrderDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('The provided ID parameter is invalid');
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });


  describe('remove', () => {
    it('should remove an order successfully', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockOrderRepository.delete.mockResolvedValue({});

      const result = await service.remove(1);

      expect(result).toEqual(mockOrder);
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({ where: { order_id: 1 } });
      expect(mockOrderRepository.delete).toHaveBeenCalledWith({ order_id: 1 });
    });

    it('should throw NOT_FOUND exception if order does not exist', async () => {
      mockOrderRepository.findOne.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(result).toEqual(new HttpException('The order does not exist', HttpStatus.NOT_FOUND));
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({ where: { order_id: 1 } });
      expect(mockOrderRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw BAD_REQUEST exception on database error', async () => {
      mockOrderRepository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await service.remove(1);

      expect(result).toEqual(new HttpException('The provided ID parameter is invalid', HttpStatus.BAD_REQUEST));
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({ where: { order_id: 1 } });
      expect(mockOrderRepository.delete).not.toHaveBeenCalled();
    });
  });
});
