import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Products } from 'src/products/entities/product.entity';
import { ImagesModule } from 'src/images/images.module';
import { Cart } from 'src/cart/entities/cart.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User,Products,Cart]), ImagesModule,forwardRef(() => AuthModule),],
  controllers: [UsersController],
  providers: [UsersService],
  exports:[UsersService],
})
export class UsersModule {}
