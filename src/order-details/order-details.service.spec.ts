import { Test, TestingModule } from '@nestjs/testing';
import { OrderDetailsService } from './order-details.service';
import { OrderService } from 'src/order/order.service';
import { ProductsService } from 'src/products/products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDetail } from './entities/order-detail.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

const mockOrderDetail = {
  id: 1,
  order_id: 1,
  product_id: 1,
  quantity: 2,
  unitPrice: 10,
  subtotal: 20,
};

const mockCreateOrderDetailDto = {
  order_id: 1,
  product_id: 1,
  quantity: 2,
  unitPrice: 10,
};

const mockUpdateOrderDetailDto = {
  quantity: 3,
  unitPrice: 15,
};

const mockOrderService = {
  findOne: jest.fn(),
};

const mockProductsService = {
  findOne: jest.fn(),
};

const mockOrderDetailsRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('OrderDetailsService', () => {
  let service: OrderDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderDetailsService,
        { provide: OrderService, useValue: mockOrderService },
        { provide: ProductsService, useValue: mockProductsService },
        { provide: getRepositoryToken(OrderDetail), useValue: mockOrderDetailsRepository },
      ],
    }).compile();

    service = module.get<OrderDetailsService>(OrderDetailsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order detail successfully', async () => {
      mockOrderService.findOne.mockResolvedValue({});
      mockProductsService.findOne.mockResolvedValue({});
      mockOrderDetailsRepository.findOne.mockResolvedValue(undefined);
      mockOrderDetailsRepository.create.mockReturnValue(mockOrderDetail);
      mockOrderDetailsRepository.save.mockResolvedValue(mockOrderDetail);

      const result = await service.create(mockCreateOrderDetailDto);
      expect(result).toEqual(mockOrderDetail);
      expect(mockOrderService.findOne).toHaveBeenCalledWith(mockCreateOrderDetailDto.order_id);
      expect(mockProductsService.findOne).toHaveBeenCalledWith(mockCreateOrderDetailDto.product_id);
      expect(mockOrderDetailsRepository.findOne).toHaveBeenCalledWith({ where: { order_id: mockCreateOrderDetailDto.order_id, product_id: mockCreateOrderDetailDto.product_id } });
      expect(mockOrderDetailsRepository.create).toHaveBeenCalledWith({ ...mockCreateOrderDetailDto, subtotal: 20 });
      expect(mockOrderDetailsRepository.save).toHaveBeenCalledWith(mockOrderDetail);
    });

    it('should throw NOT_FOUND exception if order does not exist', async () => {
      mockOrderService.findOne.mockResolvedValue(new HttpException('The order does not exist', HttpStatus.NOT_FOUND));
      const result = await service.create(mockCreateOrderDetailDto);
      expect(result).toEqual(new HttpException('The order does not exist', HttpStatus.NOT_FOUND));
      expect(mockOrderService.findOne).toHaveBeenCalledWith(mockCreateOrderDetailDto.order_id);
      expect(mockProductsService.findOne).not.toHaveBeenCalled();
      expect(mockOrderDetailsRepository.findOne).not.toHaveBeenCalled();
      expect(mockOrderDetailsRepository.create).not.toHaveBeenCalled();
      expect(mockOrderDetailsRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NOT_FOUND exception if product does not exist', async () => {
      mockOrderService.findOne.mockResolvedValue({});
      mockProductsService.findOne.mockResolvedValue(new HttpException('The product does not exist', HttpStatus.NOT_FOUND));
      const result = await service.create(mockCreateOrderDetailDto);
      expect(result).toEqual(new HttpException('The product does not exist', HttpStatus.NOT_FOUND));
      expect(mockOrderService.findOne).toHaveBeenCalledWith(mockCreateOrderDetailDto.order_id);
      expect(mockProductsService.findOne).toHaveBeenCalledWith(mockCreateOrderDetailDto.product_id);
      expect(mockOrderDetailsRepository.findOne).not.toHaveBeenCalled();
      expect(mockOrderDetailsRepository.create).not.toHaveBeenCalled();
      expect(mockOrderDetailsRepository.save).not.toHaveBeenCalled();
    });

    it('should throw CONFLICT exception if order detail already exists', async () => {
      mockOrderService.findOne.mockResolvedValue({});
      mockProductsService.findOne.mockResolvedValue({});
      mockOrderDetailsRepository.findOne.mockResolvedValue(mockOrderDetail);
      const result = await service.create(mockCreateOrderDetailDto);
      expect(result).toEqual(new HttpException('There is already an order detail registered with the same order and product, update the existing record. ', HttpStatus.CONFLICT));
      expect(mockOrderService.findOne).toHaveBeenCalledWith(mockCreateOrderDetailDto.order_id);
      expect(mockProductsService.findOne).toHaveBeenCalledWith(mockCreateOrderDetailDto.product_id);
      expect(mockOrderDetailsRepository.findOne).toHaveBeenCalledWith({ where: { order_id: mockCreateOrderDetailDto.order_id, product_id: mockCreateOrderDetailDto.product_id } });
      expect(mockOrderDetailsRepository.create).not.toHaveBeenCalled();
      expect(mockOrderDetailsRepository.save).not.toHaveBeenCalled();
    });

    it('should throw INTERNAL_SERVER_ERROR on database error', async () => {
      mockOrderService.findOne.mockRejectedValue(new Error('Database error'));
      const result = await service.create(mockCreateOrderDetailDto);
      expect(result).toEqual(new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR));
      expect(mockOrderService.findOne).toHaveBeenCalledWith(mockCreateOrderDetailDto.order_id);
      expect(mockProductsService.findOne).not.toHaveBeenCalled();
      expect(mockOrderDetailsRepository.findOne).not.toHaveBeenCalled();
      expect(mockOrderDetailsRepository.create).not.toHaveBeenCalled();
      expect(mockOrderDetailsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all order details', async () => {
      mockOrderDetailsRepository.find.mockResolvedValue([mockOrderDetail]);
      const result = await service.findAll();
      expect(result).toEqual([mockOrderDetail]);
      expect(mockOrderDetailsRepository.find).toHaveBeenCalled();
    });

    it('should throw INTERNAL_SERVER_ERROR on database error', async () => {
      mockOrderDetailsRepository.find.mockRejectedValue(new Error('Database error'));
      const result = await service.findAll();
      expect(result).toEqual(new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR));
      expect(mockOrderDetailsRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an order detail by id', async () => {
      mockOrderDetailsRepository.findOne.mockResolvedValue(mockOrderDetail);
      const result = await service.findOne(1);
      expect(result).toEqual(mockOrderDetail);
      expect(mockOrderDetailsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NOT_FOUND exception if order detail does not exist', async () => {
      mockOrderDetailsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.findOne(1);
      expect(result).toEqual(new HttpException('OrderDetail does not exist', HttpStatus.NOT_FOUND));
      expect(mockOrderDetailsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw BAD_REQUEST exception on database error', async () => {
      mockOrderDetailsRepository.findOne.mockRejectedValue(new Error('Database error'));
      const result = await service.findOne(1);
      expect(result).toEqual(new HttpException('The provided ID parameter is invalid', HttpStatus.BAD_REQUEST));
      expect(mockOrderDetailsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('update', () => {
    it('should update an order detail successfully', async () => {
      mockOrderDetailsRepository.findOne.mockResolvedValue(mockOrderDetail);
      mockOrderDetailsRepository.update.mockResolvedValue({});
      const result = await service.update(1, mockUpdateOrderDetailDto);
      expect(result).toEqual({ ...mockOrderDetail, ...mockUpdateOrderDetailDto, subtotal: 45 });
      expect(mockOrderDetailsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockOrderDetailsRepository.update).toHaveBeenCalledWith(1, { ...mockOrderDetail, ...mockUpdateOrderDetailDto, subtotal: 45 });
    });
  
    it('should throw CONFLICT exception if order detail does not exist', async () => {
      mockOrderDetailsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.update(1, mockUpdateOrderDetailDto);
      expect(result).toEqual(new HttpException('The orderDetails does not exist', HttpStatus.CONFLICT));
      expect(mockOrderDetailsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockOrderDetailsRepository.update).not.toHaveBeenCalled();
    });
  
    it('should throw BAD_REQUEST exception on database error', async () => {
      mockOrderDetailsRepository.findOne.mockRejectedValue(new Error('Database error'));
      const result = await service.update(1, mockUpdateOrderDetailDto);
      expect(result).toEqual(new HttpException('The provided ID parameter is invalid', HttpStatus.BAD_REQUEST));
      expect(mockOrderDetailsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockOrderDetailsRepository.update).not.toHaveBeenCalled();
    });
  
    it('should throw NOT_FOUND exception if the new order does not exist', async () => {
      mockOrderDetailsRepository.findOne.mockResolvedValue(mockOrderDetail);
      mockOrderService.findOne.mockResolvedValue(new HttpException('The order does not exist', HttpStatus.NOT_FOUND));
      const result = await service.update(1, { ...mockUpdateOrderDetailDto, order_id: 2 });
      expect(result).toEqual(new HttpException('The order does not exist', HttpStatus.NOT_FOUND));
      expect(mockOrderService.findOne).toHaveBeenCalledWith(2);
      expect(mockProductsService.findOne).not.toHaveBeenCalled();
      expect(mockOrderDetailsRepository.update).not.toHaveBeenCalled();
    });
  
    it('should throw NOT_FOUND exception if the new product does not exist', async () => {
      mockOrderDetailsRepository.findOne.mockResolvedValue(mockOrderDetail);
      mockProductsService.findOne.mockResolvedValue(new HttpException('The product does not exist', HttpStatus.NOT_FOUND));
      const result = await service.update(1, { ...mockUpdateOrderDetailDto, product_id: 2 });
      expect(result).toEqual(new HttpException('The product does not exist', HttpStatus.NOT_FOUND));
      expect(mockOrderService.findOne).not.toHaveBeenCalled();
      expect(mockProductsService.findOne).toHaveBeenCalledWith(2);
      expect(mockOrderDetailsRepository.update).not.toHaveBeenCalled();
    });
  });
  
  describe('remove', () => {
    it('should remove an order detail successfully', async () => {
      mockOrderDetailsRepository.findOne.mockResolvedValue(mockOrderDetail);
      const result = await service.remove(1);
      expect(result).toEqual(mockOrderDetail);
      expect(mockOrderDetailsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockOrderDetailsRepository.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NOT_FOUND exception if order detail does not exist', async () => {
      mockOrderDetailsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.remove(1);
      expect(result).toEqual(new HttpException('The orderDetails does not exist', HttpStatus.NOT_FOUND));
      expect(mockOrderDetailsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockOrderDetailsRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw BAD_REQUEST exception on database error', async () => {
      mockOrderDetailsRepository.findOne.mockRejectedValue(new Error('Database error'));
      const result = await service.remove(1);
      expect(result).toEqual(new HttpException('The provided ID parameter is invalid', HttpStatus.BAD_REQUEST));
      expect(mockOrderDetailsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockOrderDetailsRepository.delete).not.toHaveBeenCalled();
    });
  });
});
