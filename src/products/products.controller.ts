import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpException, Query, NotFoundException, UseInterceptors, UploadedFile, UseGuards, } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Products } from './entities/product.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductInterface } from './interface/product.interface';
import { AuthGuard } from 'src/auth/auth.guard';


@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }


  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() CreateProductDto: CreateProductDto): Promise<HttpException | ProductInterface> {
    return this.productsService.createProduct(CreateProductDto);
  }

  @Get()
  findAllProduct(@Query('userId') user_id?: number): Promise<HttpException | ProductInterface[]> {
    if (user_id) {
      return this.productsService.findAllByUserId(user_id);
    }
    return this.productsService.findAllProduct();

  }

  @Get(':id_prod')
  findOne(@Param('id_prod', ParseIntPipe) id_prod: number): Promise<HttpException | ProductInterface> {
    return this.productsService.findOne(id_prod);
  }


  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id_prod')
  updateProduct(@Param('id_prod') id_prod: number, @Body() updateProductDto: UpdateProductDto): Promise<HttpException | ProductInterface> {
    return this.productsService.updateProduct(id_prod, updateProductDto);
  }


  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id_prod')
  removeProduct(@Param('id_prod') id: number): Promise<HttpException | ProductInterface> {
    return this.productsService.removeProduct(id);
  }

  @Get(':productId/images')
  getProductImages(@Param('productId') productId: string): Promise<HttpException | { productId: number; urlImage: string | string[]; }> {
    return this.productsService.getProductImages(+productId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post(':productId/images')
  @UseInterceptors(FileInterceptor("file"))
  async uploadProductImage(@Param('productId') productId: string, @UploadedFile() file): Promise<HttpException | { productId: number; urlImage: string; }> {
    const imageUrl = await this.productsService.uploadProductImage(+productId, file);
    return imageUrl;
  }
  
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':productId/images')
  deleteProductImages(@Param('productId') productId: string): Promise<HttpException | { productId: number; message: string; }> {
    return this.productsService.deleteProductImages(+productId)
  }
}
