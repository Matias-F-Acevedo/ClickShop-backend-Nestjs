import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { Products } from 'src/products/entities/product.entity';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(Products) private productRepository: Repository<Products>
  ) {}

  async createCart(userId: number): Promise<Cart> {
    const newCart = this.cartRepository.create({ userId});
    const savedCart = await this.cartRepository.save(newCart);
    return savedCart;
  }
   
 
  async getCarts() {
    try {
      const carts = await this.cartRepository.find({ relations: ["user", "products"] });
  
      if (!carts.length) {
        // En lugar de lanzar una excepción, devuelve un array vacío
        return [];
      }
  
      return carts;
    } catch (error) {
      console.log(error)
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  

  async getCartById(id: number) {
    const cart = await this.cartRepository.findOne({ where: { id }, relations: ["products", "user"]});
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    cart.totalPrice = this.calculateTotalPrice(cart);
    return cart;
  }

  async updateCart(userId: number, updateCartDto: UpdateCartDto): Promise<Cart> {
    try {
      const cart = await this.cartRepository.findOne({ 
        where: { userId: userId }, 
        relations: ["products", "user"]
      });
  
      if (!cart) {
        throw new NotFoundException('Cart not found');
      }
  
      const newProduct = await this.productRepository.findOne({ where: { productId: updateCartDto.productId } });
      if (!newProduct) {
        throw new NotFoundException('Product not found');
      }
  
      // Verificar si el producto ya está en el carrito
      const productInCart = cart.products.find(product => product.productId === newProduct.productId);
      if (productInCart) {
        // Si el producto ya está en el carrito, no hacer nada
        console.log('El producto ya está en el carrito');
        return cart;
      }
   
      // Agregar el nuevo producto al carrito
      cart.products.push(newProduct);
      // Calcular el nuevo precio total del carrito
      cart.totalPrice = this.calculateTotalPrice(cart);
  
      // Guardar el carrito actualizado
      const updatedCart = await this.cartRepository.save(cart);
  
      return updatedCart;
    } catch (error) {
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  
  private calculateTotalPrice(cart: Cart): number {
    return cart.products.reduce((total, product) => total + product.price, 0);
  }

  async deleteCart(id: number) {
    const cart = await this.cartRepository.findOne({ where: { id } });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
  
    return this.cartRepository.remove(cart);
  }
}
