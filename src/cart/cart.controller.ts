import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity'; 
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('carts')
@ApiBearerAuth()
@Controller('carts') 
export class CartController { 
  constructor(private cartService: CartService) {}
  @Post()
  createCart(@Body("userId") userId: number): Promise<Cart>  {
    return this.cartService.createCart(userId); 
  }

  @Get()
  getCarts(): Promise<Cart[]> { 
    
    return this.cartService.getCarts(); 
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    const cart = await this.cartService.getCartById(id); 
    if (!cart) {
      throw new NotFoundException('Cart not found'); 
    }
    return cart; 
  }

  @Put(':userId/update')
  async update(@Param('userId', ParseIntPipe) userId: number, @Body() updateCartDto: UpdateCartDto) {
    try {
      const updatedCart = await this.cartService.updateCart(userId, updateCartDto.newProductId);
      return updatedCart;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const deletedCart = await this.cartService.deleteCart(id); 
    if (!deletedCart) {
      throw new NotFoundException('Cart not found'); 
    }
    return deletedCart; 
  }
}
