import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDetailDto } from './dto/create-order-detail.dto';
import { UpdateOrderDetailDto } from './dto/update-order-detail.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDetail } from './entities/order-detail.entity';
import { Repository } from 'typeorm';
import { OrderService } from 'src/order/order.service';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class OrderDetailsService {

  constructor(@InjectRepository(OrderDetail)
  private orderDetailsRepository: Repository<OrderDetail>,
    private orderService: OrderService,
    private productsService: ProductsService,
  ) { }


  async create(createOrderDetailsDto: CreateOrderDetailDto) {

    try {

      // verifico que exite la orden:
      const orderFound = await this.orderService.findOne(createOrderDetailsDto.order_id);

      if (orderFound instanceof HttpException) {
        return new HttpException('The order does not exist', HttpStatus.NOT_FOUND);
      }

      // verifico que existe el producto: 
      const productFound = await this.productsService.findOne(createOrderDetailsDto.product_id);

      if (productFound instanceof HttpException) {
        return new HttpException('The product does not exist', HttpStatus.NOT_FOUND);
      }

      // verifico que no exista un ordeDetails para un order con el mismo producto. 
      const OrderDetails = await this.orderDetailsRepository.findOne({ where: { order_id: createOrderDetailsDto.order_id, product_id: createOrderDetailsDto.product_id } });

      if (OrderDetails) {
        return new HttpException('There is already an order detail registered with the same order and product, update the existing record. ', HttpStatus.CONFLICT);
      }

      const newOrderDetails = this.orderDetailsRepository.create({ ...createOrderDetailsDto, subtotal: createOrderDetailsDto.unitPrice * createOrderDetailsDto.quantity });
      return this.orderDetailsRepository.save(newOrderDetails);

    } catch (error) {

      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }


  async findAll() {
    try {
      const ordersDetails = await this.orderDetailsRepository.find();
      return ordersDetails;
    } catch (error) {

    }
    return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
  }


  async findOne(id: number) {
    try {
      const orderDetails = await this.orderDetailsRepository.findOne({
        where: { id: id },
      });
      if (!orderDetails) {
        return new HttpException('OrderDetail does not exist', HttpStatus.NOT_FOUND);
      }
      return orderDetails;

    } catch (error) {

      return new HttpException('The provided ID parameter is invalid', HttpStatus.BAD_REQUEST);
    }

  }

  async update(id: number, updateOrderDetailDto: UpdateOrderDetailDto) {
    try {
      const orderDetail = await this.orderDetailsRepository.findOne({
        where: { id: id },
      });

      if (!orderDetail) {
        return new HttpException('The orderDetails does not exist', HttpStatus.CONFLICT);
      }

      // verifico que exite la orden:
      if (updateOrderDetailDto.order_id) {
        const orderFound = await this.orderService.findOne(updateOrderDetailDto.order_id);

        if (orderFound instanceof HttpException) {
          return new HttpException('The order does not exist', HttpStatus.NOT_FOUND);
        }
      }

      // verifico que existe el producto:
      if (updateOrderDetailDto.product_id) {

        const productFound = await this.productsService.findOne(updateOrderDetailDto.product_id);

        if (productFound instanceof HttpException) {
          return new HttpException('The product does not exist', HttpStatus.NOT_FOUND);
        }
      }

      // Con esta solución, primero filtramos las propiedades definidas en updateOrderDetailDto utilizando Object.keys() y filter(). Luego, reducimos este conjunto de propiedades a un solo objeto utilizando reduce() y lo pasamos como el segundo argumento a Object.assign(). Esto garantiza que updateOrderDetail solo contenga las propiedades definidas en updateOrderDetailDto.
      let updateOrderDetail = Object.assign({}, orderDetail,
        Object.keys(updateOrderDetailDto)
          .filter(key => updateOrderDetailDto[key] !== undefined)
          .reduce((obj, key) => {
            obj[key] = updateOrderDetailDto[key];
            return obj;
          }, {})
      );


      updateOrderDetail.subtotal = updateOrderDetail.unitPrice * updateOrderDetail.quantity;


      await this.orderDetailsRepository.update(id, updateOrderDetail);

      return updateOrderDetail;

    } catch (error) {
      return new HttpException('The provided ID parameter is invalid', HttpStatus.BAD_REQUEST);
    }
  }


  async remove(id: number) {
    try {
      const orderDetail = await this.orderDetailsRepository.findOne({
        where: { id: id },
      });
      if (!orderDetail) {
        return new HttpException('The orderDetails does not exist', HttpStatus.NOT_FOUND);
      }
      this.orderDetailsRepository.delete({ id: id });
      return orderDetail;

    } catch (error) {
      return new HttpException('The provided ID parameter is invalid', HttpStatus.BAD_REQUEST);
    }
  }
}
