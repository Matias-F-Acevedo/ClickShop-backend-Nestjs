import { Controller, Get, Post, Body,Param, Delete, HttpException, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { Favorite } from './entities/favorite.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) { }

  @UseGuards(AuthGuard)
  @Get(':userid')
  findAll(@Param('userid') userid: string): Promise<HttpException | Favorite[]> {
    return this.favoritesService.findAllFavorites(+userid);
  }

  @UseGuards(AuthGuard)
  @Post()
  // habilita la transformacion del objeto al tipo del DTO antes de usarlo en la logica.
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createFavoriteDto: CreateFavoriteDto): Promise<HttpException | Favorite>  {
    return this.favoritesService.addFavorite(createFavoriteDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':userid/:productId')
  remove(@Param('userid') userid: string,@Param('productId') productId: string): Promise<HttpException | Favorite> {
    return this.favoritesService.removeFavorite(+userid,+productId);
  }

}
