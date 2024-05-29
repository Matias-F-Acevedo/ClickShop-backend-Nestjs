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
      const orders = await this.orderRepository.find();
      return orders;
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
