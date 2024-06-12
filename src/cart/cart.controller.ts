import { Controller, Get, Post, Body, Patch, Param, Delete,HttpException, Put, } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartInterface } from './interface/cart.interface';
import { CreateCartItemsDto } from './dto/create-cart-items.dto';
import { UpdateCartItemQuantityDto } from './dto/update-cart-item-quantity.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { CartItems } from './entities/cart-items.entity';
import { Order } from 'src/order/entities/order.entity';



@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }


  @Post(':userId')
  create(@Param('userId') userId: string, @Body() createCartItemsDto: CreateCartItemsDto): Promise<CartItems | HttpException> {
    return this.cartService.addItemToCart(+userId, createCartItemsDto);
  }


  @Get(':userId')
  findOneByUserId(@Param('userId') userId: string): Promise<HttpException | CartInterface> {
    return this.cartService.findOneByUserId(+userId);
  }

  
  @Get(':userId/items')
  getAllCartItems(@Param('userId') userId: string): Promise<HttpException | CartItems[]>{
    return this.cartService.getAllCartItems(+userId);
  }


  @Put(':userId/items/:itemId/quantity')
  updateCartItemQuantity(
    @Param('userId') userId: number,
    @Param('itemId') itemId: number,
    @Body() updateCartItemQuantityDto: UpdateCartItemQuantityDto,
  ): Promise<CartItems | HttpException> {
    return this.cartService.updateCartItemQuantity(userId, itemId, updateCartItemQuantityDto.quantity);
  }


  @Delete(':userId/items/:itemId')
  removeCartItem(
    @Param('userId') userId: number,
    @Param('itemId') itemId: number,
  ): Promise<HttpException | CartItems> {
    return this.cartService.removeCartItem(userId, itemId);
  }


  @Delete(':userId')
  removeAllCartItem(
    @Param('userId') userId: number,
  ): Promise<HttpException | CartItems[]> {
    return this.cartService.removeAllCartItem(userId);
  }


  @Post(':userId/checkout')
  async checkout(@Param('userId') userId: string,@Body() createAddressDto: CreateAddressDto): Promise<{message:string ,order:Order | HttpException}>{
      const order = await this.cartService.checkout(+userId, createAddressDto);
      return { message: 'Order placed successfully', order};
  }
}

