import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';



@Module({
  imports: [TypeOrmModule.forFeature([Order]),
  UsersModule
],
  controllers: [OrderController],
  providers: [OrderService],
  exports:[OrderService],
})
export class OrderModule {}
