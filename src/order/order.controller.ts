import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, HttpException, Query, NotFoundException, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @UseGuards(AuthGuard)
  @Post()
  // habilita la transformacion del objeto al tipo del DTO antes de usarlo en la logica.
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createOrderDto: CreateOrderDto): Promise<HttpException | Order> {
    return this.orderService.create(createOrderDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query('userId') user_id?: number): Promise<HttpException | Order[]> {

    if (user_id) {
      return this.orderService.findAllByUserId(user_id);
    }

    return this.orderService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<HttpException | Order> {
    return this.orderService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Get('product-owner/:ownerId')
  async getOrdersForProductOwnerById(@Param('ownerId') ownerId: string) {
    const orders = await this.orderService.getOrdersForProductOwnerById(+ownerId);
    return orders;
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto): Promise<HttpException | Order> {
    return this.orderService.update(+id, updateOrderDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<HttpException | Order> {
    return this.orderService.remove(+id);
  }
}
