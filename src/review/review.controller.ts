import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, HttpException, Query, NotFoundException, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

  @UseGuards(AuthGuard)
  @Post()
  // habilita la transformacion del objeto al tipo del DTO antes de usarlo en la logica.
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createReviewDto: CreateReviewDto): Promise<HttpException | Review> {
    return this.reviewService.create(createReviewDto);
  }

  @Get()
  findAll(@Query('productId') productId?: number): Promise<HttpException | Review[]> {
    try {
      if (!productId) {
        return this.reviewService.findAll();
      }
      return this.reviewService.findAllByProductId(productId);

    } catch (error) {
      throw new NotFoundException("Not found")
    }
  }


  @Get(':id')
  findOne(@Param('id') id: string): Promise<HttpException | Review> {
    return this.reviewService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto): Promise<HttpException | Review> {
    return this.reviewService.update(+id, updateReviewDto);
  }
  
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<HttpException | Review> {
    return this.reviewService.remove(+id);
  }
}
