import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';
import { OrderDetailsModule } from './order-details/order-details.module';
import { ReviewModule } from './review/review.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ImagesModule } from './images/images.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FirebaseModule } from './firebase/firebase.module';
import configuration from 'config/configuration';
import { CartModule } from './cart/cart.module';
import { FavoritesModule } from './favorites/favorites.module';


@Module({
  imports: [

    ConfigModule.forRoot({
      envFilePath: './env/.env',
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get<string>('config.db_host'),
        username: configService.get<string>('config.db_username'),
        password: configService.get<string>('config.db_password'),
        port: configService.get<number>('config.db_port'),
        database: configService.get<string>('config.db_database'),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: configService.get<string>('config.email_user'),
            pass: configService.get<string>('config.email_pass'),
          },
        }
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    OrderModule,
    OrderDetailsModule,
    ReviewModule, CategoryModule,ProductsModule,CartModule,FirebaseModule, ImagesModule, FavoritesModule
  ],
})
export class AppModule { }
 
