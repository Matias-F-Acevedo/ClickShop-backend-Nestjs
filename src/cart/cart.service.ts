import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartInterface } from './interface/cart.interface';
import { CreateCartItemsDto } from './dto/create-cart-items.dto';
import { CartItems } from './entities/cart-items.entity';
import { ProductsService } from 'src/products/products.service';
import { Order } from 'src/order/entities/order.entity';
import { OrderDetail } from 'src/order-details/entities/order-detail.entity';
import { OrderStatus } from 'src/order/entities/order.entity';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class CartService {

  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItems)
    private cartItemsRepository: Repository<CartItems>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    private productsService: ProductsService,
  ) { }



  async getAllCartItems(userId: number): Promise<HttpException | CartItems[]> {
    try {
      const cart = await this.cartRepository.findOne({ where: { user_id: userId } });
      if (!cart) {
        return new HttpException('Cart not found', HttpStatus.NOT_FOUND);
      }
      return this.cartItemsRepository.find({ where: { cart_id: cart.cart_id }, relations: ["product"] });
    } catch (error) {
      throw new HttpException('Error getting cart items', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async findOneByUserId(user_id: number): Promise<HttpException | CartInterface> {
    try {
      const cart = await this.cartRepository.findOne({
        where: { user_id: user_id }, relations: ["cartItems"]
      });
      if (!cart) {
        return new HttpException('Cart does not exist', HttpStatus.NOT_FOUND);
      }
      return cart;

    } catch (error) {

      return new HttpException('The provided ID parameter is invalid', HttpStatus.BAD_REQUEST);
    }

  }



  async addItemToCart(userId: number, createCartItemsDto: CreateCartItemsDto): Promise<HttpException | CartItems> {

    try {
      // verifico que exite el cart:
      const cartFound = await this.findOneByUserId(userId);

      if (cartFound instanceof HttpException) {
        return new HttpException('The cart does not exist', HttpStatus.NOT_FOUND);
      }

      // verifico que existe el producto: 
      const productFound = await this.productsService.findOne(createCartItemsDto.product_id);

      if (productFound instanceof HttpException) {
        return new HttpException('The product does not exist', HttpStatus.NOT_FOUND);
      }

      // verifico que no exista un CartItems para un cart con el mismo producto.
      const cartItems = await this.cartItemsRepository.findOne({ where: { cart_id: cartFound.cart_id, product_id: createCartItemsDto.product_id } });

      if (cartItems) {
        return new HttpException('There is already an Cart Items registered with the same cart and product, update the existing record. ', HttpStatus.CONFLICT);
      }

      const newCartItems = this.cartItemsRepository.create({ ...createCartItemsDto, subtotal: createCartItemsDto.unitPrice * createCartItemsDto.quantity, cart_id: cartFound.cart_id });

      const cartSaved = await this.cartItemsRepository.save(newCartItems);
      await this.updateCartTotal(cartFound.cart_id);
      return cartSaved


    } catch (error) {
      console.log(error);

      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }


  async updateCartItemQuantity(userId: number, cartItemId: number, newQuantity: number): Promise<HttpException | CartItems> {
    try {
      // verifico que exite el Cart:
      const cartFound = await this.findOneByUserId(userId);

      if (cartFound instanceof HttpException) {
        return new HttpException('The cart does not exist', HttpStatus.NOT_FOUND);
      }



      const cartItem = await this.cartItemsRepository.findOne({
        where: { cartItem_id: cartItemId },
      });

      if (!cartItem) {
        return new HttpException('The CartItems does not exist', HttpStatus.CONFLICT);
      }

      cartItem.quantity = newQuantity;
      cartItem.subtotal = cartItem.unitPrice * newQuantity;

      const itemSaved = await this.cartItemsRepository.save(cartItem);

      // recalcula el total del carrito:
      const cartId = cartItem.cart_id;
      await this.updateCartTotal(cartId);
      return itemSaved
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.BAD_REQUEST);
    }
  }


  async removeCartItem(userId: number, cartItemId: number): Promise<HttpException | CartItems> {

    try {
      // verifico que exite el Cart:
      const cartFound = await this.findOneByUserId(userId);

      if (cartFound instanceof HttpException) {
        return new HttpException('The cart does not exist', HttpStatus.NOT_FOUND);
      }

      const cartItem = await this.cartItemsRepository.findOne({
        where: { cartItem_id: cartItemId },
      });

      if (!cartItem) {
        return new HttpException('Cart item not found', HttpStatus.NOT_FOUND);
      }

      await this.cartItemsRepository.delete(cartItemId);

      const cartId = cartItem.cart_id;
      await this.updateCartTotal(cartId);

      return cartItem;
    } catch (error) {

      throw new HttpException('Error removing cart item', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async removeAllCartItem(userId: number): Promise<HttpException | CartItems[]> {
    try {
      const cart = await this.cartRepository.findOne({ where: { user_id: userId } });

      if (!cart) {
        return new HttpException('Cart not found', HttpStatus.NOT_FOUND);
      }
      const itemsDeleted = await this.cartItemsRepository.find({ where: { cart_id: cart.cart_id } })
      await this.cartItemsRepository.delete({ cart_id: cart.cart_id });
      await this.updateCartTotal(cart.cart_id);
      return itemsDeleted;

    } catch (error) {
      throw new HttpException('Error clearing cart', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  private async updateCartTotal(cartId: number): Promise<HttpException | void> {
    try {
      const cartItems = await this.cartItemsRepository.find({ where: { cart_id: cartId } });

      const total = cartItems.reduce((sum, item) => sum + (+item.subtotal), 0);

      await this.cartRepository.update(cartId, { total });
    } catch (error) {

      throw new HttpException('error updating cart total', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async checkout(userId: number, createAddressDto: CreateAddressDto): Promise<HttpException | Order> {
    try {
      const cart = await this.cartRepository.findOne({ where: { user_id: userId }, relations: ['cartItems'] });
      if (!cart) {
        throw new HttpException('Cart not found', HttpStatus.NOT_FOUND);
      }
      // creo una orden
      const order = new Order();
      order.user_id = userId;
      order.total = 0;
      order.status = OrderStatus.PENDING;
      order.shippingAddress = createAddressDto.shippingAddress;
      order.city =createAddressDto.city;
      order.province=createAddressDto.province;
      order.postalCode= createAddressDto.postalCode;
      order.country= createAddressDto.country;
      order.date = new Date();
      await this.orderRepository.save(order);

      // creo los detalles de orden para cada producto en el carrito
      for (const cartItem of cart.cartItems) {
        const orderDetail = new OrderDetail();
        orderDetail.order = order;
        orderDetail.product_id = cartItem.product_id;
        orderDetail.quantity = cartItem.quantity;
        orderDetail.unitPrice = cartItem.unitPrice;
        orderDetail.subtotal = +cartItem.subtotal;
        await this.orderDetailRepository.save(orderDetail);
        order.total += orderDetail.subtotal;
      }
      // guardo nuevamente, ya que el total lo calcule despues de crear la order (necesito una order para tener un orderDetails).
      await this.orderRepository.save(order);

      // eliminar todos los items del carrito
      this.removeAllCartItem(userId);
      return order;
    } catch (error) {
      console.log(error);
      throw new HttpException('Error checking out', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
