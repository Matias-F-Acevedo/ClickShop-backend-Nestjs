import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { OrderDetailsModule } from './order-details/order-details.module';
import { ReviewModule } from './review/review.module';
import { MailerModule } from '@nestjs-modules/mailer';



@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      username: "root",
      password: "root",
      port: 3306,
      database: "db_clickshop",
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      synchronize: false,
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port:465,
        secure:true,
        auth: {
          user: 'clickshop836@gmail.com',
          pass: 'iljjujpzwquiwblr',
        },
      }
    }),
    UsersModule,
    AuthModule,
    OrderModule,
    OrderDetailsModule,
    ReviewModule, 
    CategoryModule, 
    CartModule, 
    ProductsModule
  ],
})
export class AppModule { }

