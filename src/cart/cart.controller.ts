import { Controller, Get, Post, Body,Param, Delete,HttpException, Put, UseGuards, } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CartInterface } from './interface/cart.interface';
import { CreateCartItemsDto } from './dto/create-cart-items.dto';
import { UpdateCartItemQuantityDto } from './dto/update-cart-item-quantity.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { Order } from 'src/order/entities/order.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { CartItemsInterface } from './interface/cartItems.interface';


@ApiTags('cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @UseGuards(AuthGuard)
  @Post(':userId')
  create(@Param('userId') userId: string, @Body() createCartItemsDto: CreateCartItemsDto): Promise<CartItemsInterface | HttpException> {
    return this.cartService.addItemToCart(+userId, createCartItemsDto);

  }

  @UseGuards(AuthGuard)
  @Get(':userId')
  findOneByUserId(@Param('userId') userId: string): Promise<HttpException | CartInterface> {
    return this.cartService.findOneByUserId(+userId);
  }

  @UseGuards(AuthGuard)
  @Get(':userId/items')
  getAllCartItems(@Param('userId') userId: string): Promise<HttpException | CartItemsInterface[]>{
    return this.cartService.getAllCartItems(+userId);
  }

  @UseGuards(AuthGuard)
  @Put(':userId/items/:itemId/quantity')
  async updateCartItemQuantity(
    @Param('userId') userId: number,
    @Param('itemId') itemId: number,
    @Body() updateCartItemQuantityDto: UpdateCartItemQuantityDto,
  ): Promise<CartItemsInterface | HttpException> {
    return this.cartService.updateCartItemQuantity(userId, itemId, updateCartItemQuantityDto.quantity);
  }
  

  @UseGuards(AuthGuard)
  @Delete(':userId/items/:itemId')
  removeCartItem(
    @Param('userId') userId: number,
    @Param('itemId') itemId: number,
  ): Promise<HttpException | CartItemsInterface> {
    return this.cartService.removeCartItem(userId, itemId);
  }

  @UseGuards(AuthGuard)
  @Delete(':userId')
  removeAllCartItem(
    @Param('userId') userId: number,
  ): Promise<HttpException | CartItemsInterface[]> {
    return this.cartService.removeAllCartItem(userId);
  }

  @UseGuards(AuthGuard)
  @Post(':userId/checkout')
  async checkout(@Param('userId') userId: string,@Body() createAddressDto: CreateAddressDto): Promise<{message:string ,order:Order | HttpException}>{
      const order = await this.cartService.checkout(+userId, createAddressDto);
      return { message: 'Order placed successfully', order};
  }
}

 