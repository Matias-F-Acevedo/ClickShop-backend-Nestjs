import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Products } from './entities/product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryService } from 'src/category/category.service';
import { UsersService } from 'src/users/users.service';
import { ImagesService } from 'src/images/images.service';
import { ProductInterface } from './interface/product.interface';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products) private productRepository: Repository<Products>,
    private categoryService: CategoryService,
    private userService: UsersService,
    private imageService: ImagesService,
  ) { }



  async createProduct(createProductDto: CreateProductDto): Promise<HttpException | ProductInterface> {
    try {
        const categoryFound = await this.categoryService.findOne(createProductDto.category_id)
        if (categoryFound instanceof HttpException) {
            return new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }
        console.log(createProductDto)
        const userFound = await this.userService.findOne(createProductDto.user_id)
        if (userFound instanceof HttpException) {
            return new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        // Crear el nuevo producto en la base de datos
        const newProduct = this.productRepository.create(createProductDto);
        const savedProduct = await this.productRepository.save(newProduct);


        // Actualizar la propiedad product_Id del usuario con el ID del nuevo producto
        userFound.product.push(savedProduct);
        await this.userService.update(userFound.user_id ,userFound);

      const newProduct = this.productRepository.create(createProductDto)
      const saveProduct = await this.productRepository.save(newProduct)
      delete (saveProduct).isActive;
      delete (saveProduct).product_image;

      return saveProduct;

       return savedProduct;
    } catch (error) {
        return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}


 


  async findAllProduct(): Promise<HttpException | ProductInterface[]> {

    try {
      const products = await this.productRepository.find({
        where: { isActive: true }
      })

      let result: ProductInterface[] = [];

      if (products.length) {
        result = await Promise.all(products.map(async (product) => {
          delete (product).isActive;

          const imageProduct = await this.getProductImages(product.productId)

          if (!(imageProduct instanceof HttpException)) {
            return { ...product, product_image: imageProduct.urlImage }
          }
          return product;

        }));
      }
      return result;
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async findOne(id_prod: number): Promise<HttpException | ProductInterface> {

    try {
      const product = await this.productRepository.findOne({
        where: { productId: id_prod, isActive: true }
      })
      if (!product) {
        return new HttpException("The product does not exist", HttpStatus.NOT_FOUND)
      }
      delete (product).isActive;
      const imageProduct = await this.getProductImages(product.productId)

      if (!(imageProduct instanceof HttpException)) {
        return { ...product, product_image: imageProduct.urlImage }
      }
      return product;

    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }


  async findAllByUserId(user_id: number): Promise<HttpException | ProductInterface[]> {

    try {
      const products = await this.productRepository.find({
        where: { isActive: true, user_id: user_id }
      })

      let result: ProductInterface[] = [];

      if (products.length) {
        result = await Promise.all(products.map(async (product) => {
          delete (product).isActive;

          const imageProduct = await this.getProductImages(product.productId)

          if (!(imageProduct instanceof HttpException)) {
            return { ...product, product_image: imageProduct.urlImage }
          }
          return product;

        }));
      }
      return result;

    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async updateProduct(id_prod: number, updateProductDto: UpdateProductDto): Promise<HttpException | ProductInterface> {


    try {
      const product = await this.productRepository.findOne({ where: { productId: id_prod, isActive: true } })
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
      delete (product).isActive;
      delete (product).product_image;
      return { ...product, ...updateProductDto }

    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async removeProduct(id_prod: number): Promise<HttpException | ProductInterface> {

    try {
      const product = await this.productRepository.findOne({ where: { productId: id_prod, isActive: true } })
      if (!product) {
        return new HttpException("The product does not exist", HttpStatus.NOT_FOUND)
      }
      product.isActive = false;
      product.product_image = "default-image-product/default-image-product.jpeg"

      await this.deleteProductImages(product.productId);
      await this.productRepository.save(product);

      delete (product).isActive;
      delete (product).product_image;
      return product;

    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async getProductImages(productId: number): Promise<HttpException | { productId: number; urlImage: string | string[]; }> {

    try {
      const product = await this.productRepository.findOne({ where: { productId: productId, isActive: true } })

      if (!product) {
        return new HttpException("The product does not exist", HttpStatus.NOT_FOUND)
      }

      const imageDefault = "default-image-product/default-image-product.jpeg"

      if (product.product_image == imageDefault) {
        const urlImage = await this.imageService.getPublicUrl(imageDefault);
        return { productId, urlImage:[`${urlImage}`] }
      }

      const images: string[] = await this.imageService.listFilesInFolder(product.product_image);

      if (!images.length) {
        return new HttpException("This product has no images stored", HttpStatus.NOT_FOUND)
      }

      const imagePath = `${product.product_image}/`

      const urlImage = await Promise.all(images.map(async (image) => {
        return await this.imageService.getPublicUrl(imagePath + image);
      }));

      return { productId, urlImage }

    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async uploadProductImage(productId: number, file): Promise<HttpException | { productId: number; urlImage: string; }> {
    try {

      const product = await this.productRepository.findOne({ where: { productId: productId, isActive: true } })

      if (!product) {
        return new HttpException("The product does not exist", HttpStatus.NOT_FOUND)
      }

      product.product_image = `products-images/product-${product.productId}`
      await this.productRepository.update(productId, product);

      const images: string[] = await this.imageService.listFilesInFolder(`${product.product_image}`);

      const imageCount = images.length + 1;

      if (imageCount === 4) {
        return new HttpException("Only three images per product can be uploaded", HttpStatus.CONFLICT)
      }

      const imagePath = `${product.product_image}/${imageCount}`
      await this.imageService.uploadImage(file, imagePath)

      const urlImage = await this.imageService.getPublicUrl(imagePath);

      return { productId, urlImage }

    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteProductImages(productId: number): Promise<HttpException | { productId: number; message: string; }> {
    try {

      const product = await this.productRepository.findOne({ where: { productId: productId, isActive: true } })

      if (!product) {
        return new HttpException("The product does not exist", HttpStatus.NOT_FOUND)
      }

      const imageDefault = "default-image-product/default-image-product.jpeg"

      const images: string[] = await this.imageService.listFilesInFolder(product.product_image);

      if (product.product_image == imageDefault || !images.length) {
        return new HttpException("This product has no images stored", HttpStatus.NOT_FOUND)
      }

      const imagePathToDelete = `${product.product_image}/`

      images.map(async (image) => {
        await this.imageService.deleteImage(imagePathToDelete + image);
      });

      product.product_image = imageDefault
      await this.productRepository.update(productId, product);

      return {
        productId,
        message: `Product images were successfully removed`
      };


    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
 