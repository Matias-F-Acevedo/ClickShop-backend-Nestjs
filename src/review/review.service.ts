import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class ReviewService {


  constructor(@InjectRepository(Review) private reviewRepository: Repository<Review>,
    private usersService: UsersService,
    private productsService: ProductsService,

  ) { }



  async create(createReviewDto: CreateReviewDto): Promise<HttpException | Review> {
    try {
      // verifico que exite el usuario:
      const userFound = await this.usersService.findOne(createReviewDto.user_id);

      if (userFound instanceof HttpException) {
        return new HttpException('The user does not exist', HttpStatus.NOT_FOUND);
      }

      // verifico que existe el producto: 
      const productFound = await this.productsService.findOne(createReviewDto.product_id);

      if (productFound instanceof HttpException) {
        return new HttpException('The product does not exist', HttpStatus.NOT_FOUND);
      }

      // verifico que no exista una review del producto hecha por el usuario.
      const review = await this.reviewRepository.findOne({ where: { product_id: createReviewDto.product_id, user_id: createReviewDto.user_id } });

      if (review) return new HttpException('There is already a registered user review to the product, update the existing record.', HttpStatus.CONFLICT);

      const newReview = this.reviewRepository.create(createReviewDto);

      return this.reviewRepository.save(newReview);

    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async findAll(): Promise<HttpException | Review[]> {
    try {
      const reviews = await this.reviewRepository.find();
      return reviews;
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: number): Promise<HttpException | Review> {
    try {
      const review = await this.reviewRepository.findOne({
        where: { review_id: id },
      });
      if (!review) {
        return new HttpException('Review does not exist', HttpStatus.NOT_FOUND);
      }
      return review;

    } catch (error) {

      return new HttpException('The provided ID parameter is invalid', HttpStatus.BAD_REQUEST);
    }

  }


  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<HttpException | Review> {
    try {
      const review = await this.reviewRepository.findOne({
        where: { review_id: id },
      });
      if (!review) {
        return new HttpException('The Review does not exist', HttpStatus.NOT_FOUND);
      }

      // verifico que exite el usuario:
      if (updateReviewDto.user_id) {
        const orderFound = await this.usersService.findOne(updateReviewDto.user_id)

        if (orderFound instanceof HttpException) {
          return new HttpException('The user does not exist', HttpStatus.NOT_FOUND);
        }
      }

      // verifico que existe el producto:
      if (updateReviewDto.product_id) {

        const productFound = await this.productsService.findOne(updateReviewDto.product_id);

        if (productFound instanceof HttpException) {
          return new HttpException('The product does not exist', HttpStatus.NOT_FOUND);
        }
      }


      this.reviewRepository.update(id, updateReviewDto);
      return { ...review, ...updateReviewDto };

    } catch (error) {
      return new HttpException('The provided ID parameter is invalid', HttpStatus.BAD_REQUEST);
    }

  }



  async remove(id: number): Promise<HttpException | Review> {

    try {
      const review = await this.reviewRepository.findOne({
        where: { review_id: id },
      });
      if (!review) {
        return new HttpException('The Review does not exist', HttpStatus.NOT_FOUND);
      }
      this.reviewRepository.delete({ review_id: id });
      return review;

    } catch (error) {
      return new HttpException('The provided ID parameter is invalid', HttpStatus.BAD_REQUEST);
    }

  }
}
