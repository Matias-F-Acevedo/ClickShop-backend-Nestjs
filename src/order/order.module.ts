import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';



@Module({
  imports: [TypeOrmModule.forFeature([Order]),
  UsersModule, AuthModule
],
  controllers: [OrderController],
  providers: [OrderService],
  exports:[OrderService],
})
export class OrderModule {}
