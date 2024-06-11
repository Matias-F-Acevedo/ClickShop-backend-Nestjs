import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, HttpException, Query, NotFoundException } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  // habilita la transformacion del objeto al tipo del DTO antes de usarlo en la logica.
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createOrderDto: CreateOrderDto): Promise<HttpException | Order> {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  findAll(@Query('userId') user_id?: number): Promise<HttpException | Order[]> {

    try {
      if (!user_id) {
        return this.orderService.findAll();
      }

      return this.orderService.findAllByUserId(user_id);

    } catch (error) {
      throw new NotFoundException("Not found")
    }

  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<HttpException | Order> {
    return this.orderService.findOne(+id);
  }

  @Get('product-owner/:ownerId')
  async getOrdersForProductOwnerById(@Param('ownerId') ownerId: string) {

      // Llamar al método del servicio para obtener las órdenes
      const orders = await this.orderService.getOrdersForProductOwnerById(+ownerId);
      return orders;

      
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto): Promise<HttpException | Order> {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<HttpException | Order> {
    return this.orderService.remove(+id);
  }
}
