import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { Products } from 'src/products/entities/product.entity';

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

      const carts = await this.cartRepository.find();
      
      if (!carts.length) {
        throw new NotFoundException('No carts found');
      }
       
      return carts;
    } catch (error) {
      console.log("quedo el error aca")
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

  async updateCart(userId: number, newProductId: number): Promise<Cart> {
    try {
      const cart = await this.cartRepository.findOne({ where: { userId }, relations: ["products"] });
      console.log(cart)

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }
      
      const newProduct = await this.productRepository.findOne({ where: { productId: newProductId } });
      console.log(newProduct)

      if (!newProduct) {
        throw new NotFoundException('Product not found');
      }
      cart.products.push(newProduct);
      console.log(cart)
      cart.totalPrice = this.calculateTotalPrice(cart);
      await this.cartRepository.save(cart);

      return cart;
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
