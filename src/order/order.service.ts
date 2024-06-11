import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { UsersService } from 'src/users/users.service';


@Injectable()
export class OrderService {

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private usersService: UsersService) { }


  async create(createOrderDto: CreateOrderDto): Promise<HttpException | Order> {

    try {
      const userFound = await this.usersService.findOne(createOrderDto.user_id)

      if (userFound instanceof HttpException) {
        return new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const newOrder = this.orderRepository.create(createOrderDto);
      return this.orderRepository.save(newOrder);
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }


  async findAll(): Promise<HttpException | Order[]> {
    try {
      const orders = await this.orderRepository.find({
        relations: ['orderDetail', 'orderDetail.product', 'user']});
      return {...orders};
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async findOne(id: number): Promise<HttpException | Order> {
    try {
      const order = await this.orderRepository.findOne({
        where: { order_id: id },
      });
      if (!order) {
        return new HttpException('Order does not exist', HttpStatus.NOT_FOUND);
      }
      return order;

    } catch (error) {

      return new HttpException('The provided ID parameter is invalid', HttpStatus.BAD_REQUEST);
    }

  }

  async findAllByUserId(user_id:number): Promise<HttpException | Order[]> {
    try {
      const orders = await this.orderRepository.find({
        where:{user_id: user_id},
        relations: ['orderDetail']
      });
      return orders;
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  

  async getOrdersForProductOwnerById(productOwnerId: number) {
    try {
      const orders = await this.orderRepository.createQueryBuilder('order')
        .innerJoinAndSelect('order.orderDetail', 'detail')
        .innerJoinAndSelect('detail.product', 'product')
        .innerJoinAndSelect('order.user', 'user')
        .innerJoin('product.user', 'productUser', 'productUser.user_id = :productOwnerId', { productOwnerId })
        .getMany();
      
        const formattedOrders = orders.map(order => ({
          ...order,
          orderDetail: order.orderDetail.map(detail => ({
            ...detail,
            product: {
              product_name: detail.product.product_name,
              product_image: detail.product.product_image,
            }
          })),
          user: {
            user_name: order.user.user_name,
            user_lastname: order.user.user_lastname,
            user_phoneNumber: order.user.user_phoneNumber,
            user_address: order.user.user_address,
            user_identificationNumber: order.user.user_identificationNumber,
          }
        }));
        return formattedOrders;
    } catch (error) {
      throw new Error('Error al obtener las órdenes para el propietario del producto');
    }
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<HttpException | Order> {
    try {
      const order = await this.orderRepository.findOne({
        where: { order_id: id },
      });

      if (!order) {
        return new HttpException('The order does not exist', HttpStatus.CONFLICT);
      }

      if (updateOrderDto.user_id) {
        const userFound = await this.usersService.findOne(updateOrderDto.user_id)

        if (userFound instanceof HttpException) {
          return new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
      }

      this.orderRepository.update(id, updateOrderDto);
      return { ...order, ...updateOrderDto };

    } catch (error) {
      return new HttpException('The provided ID parameter is invalid', HttpStatus.BAD_REQUEST);
    }

  }

  async remove(id: number): Promise<HttpException | Order> {

    try {
      const order = await this.orderRepository.findOne({
        where: { order_id: id },
      });
      if (!order) {
        return new HttpException('The order does not exist', HttpStatus.NOT_FOUND);
      }
      this.orderRepository.delete({ order_id: id });
      return order;

    } catch (error) {
      return new HttpException('The provided ID parameter is invalid', HttpStatus.BAD_REQUEST);
    }

  }
}
