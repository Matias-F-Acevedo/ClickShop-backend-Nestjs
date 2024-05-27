import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class FavoritesService {

  constructor(@InjectRepository(Favorite) private favoriteRepository: Repository<Favorite>,
    private usersService: UsersService,
    private productsService: ProductsService,

  ) { }

  async findAllFavorites(userId: number): Promise<HttpException | Favorite[]> {
    try {
      const favorites = await this.favoriteRepository.find({
        where: { user_id: userId },
        relations: ['product'],
      });
      return favorites;
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async addFavorite(createFavoriteDto: CreateFavoriteDto): Promise<HttpException | Favorite> {
    try {
      // verifico que exite el usuario:
      const userFound = await this.usersService.findOne(createFavoriteDto.user_id);

      if (userFound instanceof HttpException) {
        return new HttpException('The user does not exist', HttpStatus.NOT_FOUND);
      }

      // verifico que existe el producto: 
      const productFound = await this.productsService.findOne(createFavoriteDto.product_id);

      if (productFound instanceof HttpException) {
        return new HttpException('The product does not exist', HttpStatus.NOT_FOUND);
      }

      // verifico que no exista un favorito del producto hecha por el usuario.
      const favorite = await this.favoriteRepository.findOne({ where: { product_id: createFavoriteDto.product_id, user_id: createFavoriteDto.user_id } });

      if (favorite) return new HttpException("There is already a registered user's favorite for the product", HttpStatus.CONFLICT);

      const newFavorite = this.favoriteRepository.create(createFavoriteDto);

      return this.favoriteRepository.save(newFavorite);

    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }


  async  removeFavorite(userId: number, productId: number): Promise<HttpException | Favorite> {

    try {
      const favorite = await this.favoriteRepository.findOne({
        where: { product_id:productId, user_id:userId },
      });

      if (!favorite) {
        return new HttpException('The Favorite does not exist', HttpStatus.NOT_FOUND);
      }

      this.favoriteRepository.delete({ product_id:productId, user_id:userId });
      return favorite;

    } catch (error) {
      return new HttpException('The provided ID parameter is invalid', HttpStatus.BAD_REQUEST);
    }

  }
}
