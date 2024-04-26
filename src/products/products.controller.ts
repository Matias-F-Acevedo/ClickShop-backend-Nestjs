import { Controller, Get, Post, Body, Patch, Param, Delete, Put, ParseIntPipe, HttpException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Products } from './entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() CreateProductDto: CreateProductDto): Promise<HttpException | Products> {
    return this.productsService.createProduct(CreateProductDto);
  }

  @Get()
    findAllProduct(): Promise<HttpException | Products[]> {
    return this.productsService.findAllProduct();
  }

  @Get(':id_prod')
  findOne(@Param('id_prod', ParseIntPipe) id_prod: number): Promise<HttpException | Products> {
    return this.productsService.findOne(id_prod);
  }

  @Patch(':id_prod')
  updateProduct(@Param('id_prod') id_prod: number, @Body() updateProductDto: UpdateProductDto): Promise<HttpException | Products> {
    return this.productsService.updateProduct(id_prod, updateProductDto);
  }

  @Delete(':id_prod')
  removeProduct(@Param('id_prod') id: number):Promise<HttpException | Products> {
    return this.productsService.removeProduct(id);
  }
}
