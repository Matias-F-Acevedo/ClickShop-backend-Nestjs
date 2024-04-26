import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [UsersModule, JwtModule.register({
    global:true,
    secret: jwtConstants.secret,
    signOptions:{expiresIn: "1h"},
  }),TypeOrmModule.forFeature([User]) ],
  controllers: [AuthController],
  providers: [AuthService],
  exports:[AuthService],
})
export class AuthModule {}
