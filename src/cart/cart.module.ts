import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Cart } from './entities/cart.entity';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItems } from './entities/cart-items.entity';
import { ProductsModule } from 'src/products/products.module';
import { Order } from 'src/order/entities/order.entity';
import { OrderDetail } from 'src/order-details/entities/order-detail.entity';



@Module({
  imports: [TypeOrmModule.forFeature([Cart,CartItems,Order,OrderDetail]),
  UsersModule,ProductsModule,
],
  controllers: [CartController],
  providers: [CartService],
  exports:[CartService],
})
export class CartModule {}
