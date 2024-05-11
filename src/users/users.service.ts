import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserInterface } from './interface/user.interface';
import * as bcrypt from 'bcrypt';
import { Products } from 'src/products/entities/product.entity';


@Injectable()
export class UsersService {

  constructor(
  @InjectRepository(User) 
    private userRepository: Repository<User>,
  @InjectRepository(Products)
    private readonly productRepository: Repository<Products>,
) { }


  async create(createUserDto: CreateUserDto): Promise<HttpException | UserInterface> {
    try {
      const userFound = await this.userRepository.findOne({ where: { user_email: createUserDto.user_email } });

      if (userFound) throw new Error("This email is registered");

      const newUser = this.userRepository.create({ ...createUserDto, user_password: bcrypt.hashSync(createUserDto.user_password, 8) });
      const newUserSave = await this.userRepository.save(newUser)

      const userWithoutPassword = { ...newUserSave };
      delete (userWithoutPassword).user_password;

      return userWithoutPassword;


    } catch (error) {
      return new HttpException('User already exists', HttpStatus.CONFLICT);
    }
  }



  async findAll(): Promise<UserInterface[] | HttpException> {
    try {
      const users = await this.userRepository.find();
      let result: UserInterface[] = [];

      if (users.length) {
        result = users.map((u) => {
          delete (u).user_password;
          return u;
        });
      }
      return result;
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async findOne(id: number): Promise<HttpException | UserInterface> {

    try {
      const user = await this.userRepository.findOne({ where: { user_id: id }, relations: ["cart"] });
      if (!user) {
        return new HttpException('User does not exist', HttpStatus.NOT_FOUND);
      };

      const userWithoutPassword = { ...user };
      delete (userWithoutPassword).user_password;

      return userWithoutPassword;

    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }



  async update(id: number, updateUserDto: UpdateUserDto): Promise<HttpException | UserInterface> {

    try {
      const user = await this.userRepository.findOne({ where: { user_id: id } });
      if (!user) {
        return new HttpException('User does not exist', HttpStatus.CONFLICT);
      }

      // en las siguentes lines comprueba que al querer actualizar el email, no use uno de otro usuario o el que ya tenia antes.
      if (updateUserDto.user_email) {
        const user = await this.userRepository.findOne({ where: { user_email: updateUserDto.user_email } });

        if (user) return new HttpException('Email not available', HttpStatus.CONFLICT);

      }

      let userUpdate = updateUserDto;

      await this.userRepository.update(id, userUpdate);

      return this.findOne(id);

    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }


  async remove(id: number): Promise<HttpException | UserInterface> {

    try {
      const user = await this.userRepository.findOne({ where: { user_id: id } });

      if (!user) {
        return new HttpException('User does not exist', HttpStatus.NOT_FOUND);
      }

      await this.productRepository.update( {user_id: id} ,{ isActive: false });

      this.userRepository.delete({ user_id: id });

      const userWithoutPassword = { ...user };
      delete (userWithoutPassword).user_password;

      return userWithoutPassword;
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async findUserByEmail(email: string): Promise<HttpException | User> {

    try {
      const user = await this.userRepository.findOne({ where: { user_email: email } });
      if (!user) {
        return new HttpException('User does not exist', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async findUserByResetPasswordToken(resetPasswordToken:string): Promise<HttpException | User > {
    try {
      const user = await this.userRepository.findOne({ where: { reset_password_token: resetPasswordToken }});
      if (!user) {
        return new HttpException('User not found', HttpStatus.NOT_FOUND);
      };

      return user;

    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
