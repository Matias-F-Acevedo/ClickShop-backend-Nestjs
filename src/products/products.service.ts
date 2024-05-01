import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Products } from './entities/product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryService } from 'src/category/category.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products) private productRepository: Repository<Products>,
    private categoryService: CategoryService,
    private userService: UsersService
  ) { }



  async createProduct(createProductDto: CreateProductDto) {
    try {
      const categoryFound = await this.categoryService.findOne(createProductDto.category_id)
      if (categoryFound instanceof HttpException) {
        return new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      const userFound = await this.userService.findOne(createProductDto.user_id)
      if (userFound instanceof HttpException) {
        return new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const newProduct = this.productRepository.create(createProductDto)
      return this.productRepository.save(newProduct)

    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }




  async findAllProduct(): Promise<HttpException | Products[]> {

    try {
      const products = await this.productRepository.find({
        where: { isActive: true }
      })
      return products;
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async findOne(id_prod: number): Promise<HttpException | Products> {

    try {
      const product = await this.productRepository.findOne({
        where: { productId: id_prod }
      })
      if (!product) {
        return new HttpException("The product does not exist", HttpStatus.NOT_FOUND)
      }
      return product;
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }


  async findAllByUserId(user_id:number): Promise<HttpException | Products[]> {

    try {
      const products = await this.productRepository.find({
        where: { isActive: true, user_id: user_id}
      })
      return products;
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async updateProduct(id_prod: number, updateProductDto: UpdateProductDto): Promise<HttpException | Products> {


    try {
      const product = await this.productRepository.findOne({ where: { productId: id_prod , isActive:true} })
      if (!product) {
        return new HttpException("The product does not exist", HttpStatus.NOT_FOUND)
      }

      if (updateProductDto.category_id) {
        const categoryFound = await this.categoryService.findOne(updateProductDto.category_id)

        if (categoryFound instanceof HttpException) {
          return new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }
      }

      this.productRepository.update(id_prod, updateProductDto)
      return { ...product, ...updateProductDto }

    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async removeProduct(id_prod: number): Promise<HttpException | Products> {

    try {
      const product = await this.productRepository.findOne({ where: { productId: id_prod, isActive:true } })
      if (!product) {
        return new HttpException("The product does not exist", HttpStatus.NOT_FOUND)
      }
      product.isActive = false;
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }
}
