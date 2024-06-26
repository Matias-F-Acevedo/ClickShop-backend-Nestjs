import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Products } from './entities/product.entity';
import { CategoryModule } from 'src/category/category.module';
import { UsersModule } from 'src/users/users.module';
import { ImagesModule } from 'src/images/images.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Products]),
    CategoryModule, UsersModule,ImagesModule, AuthModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule { }
  