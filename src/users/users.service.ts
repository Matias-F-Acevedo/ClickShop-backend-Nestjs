import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserInterface } from './interface/user.interface';
import * as bcrypt from 'bcrypt';
import { Products } from 'src/products/entities/product.entity';
import { ImagesService } from 'src/images/images.service';
import { Cart } from 'src/cart/entities/cart.entity';


@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Products)
    private readonly productRepository: Repository<Products>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private imageService: ImagesService,
  ) { }


  async create(createUserDto: CreateUserDto): Promise<HttpException | UserInterface> {
    try {
      const userFound = await this.userRepository.findOne({ where: { user_email: createUserDto.user_email } });

      if (userFound) throw new Error("This email is registered");

      const newUser = this.userRepository.create({ ...createUserDto, user_password: bcrypt.hashSync(createUserDto.user_password, 8) });
      
      const newUserSave = await this.userRepository.save(newUser)

      const cart = this.cartRepository.create({ user: newUser });
      
      await this.cartRepository.save(cart);

      newUser.cart_id = cart.cart_id;
      await this.userRepository.save(newUser);

      const userWithoutPassword = { ...newUserSave };
      delete (userWithoutPassword).user_password;
      delete (userWithoutPassword).user_image;
      delete (userWithoutPassword).reset_password_token;
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
        result = await Promise.all(users.map(async (u) => {
          const urlImage = await this.imageService.getPublicUrl(u.user_image)
          delete (u).user_password;
          delete (u).reset_password_token;
          u.user_image = urlImage
          return u;
        }));
      }
      return result;
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async findOne(id: number): Promise<HttpException | UserInterface> {

    try {
      const user = await this.userRepository.findOne({ where: { user_id: id } });
      if (!user) {
        return new HttpException('User does not exist', HttpStatus.NOT_FOUND);
      };
      const urlImage = await this.imageService.getPublicUrl(user.user_image)

      const userWithoutPassword = { ...user, user_image: urlImage };

      delete (userWithoutPassword).user_password;
      delete (userWithoutPassword).reset_password_token;
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

      const userWithoutPassword = { ...user, ...userUpdate };
      delete (userWithoutPassword).user_password;
      delete (userWithoutPassword).reset_password_token;
      delete (userWithoutPassword).user_image;
      delete (userWithoutPassword).user_createdAt;
      delete (userWithoutPassword).cart_id;

      return userWithoutPassword;

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

      await this.productRepository.update({ user_id: id }, { isActive: false });
      await this.deleteProfileImage(user.user_id);
      await this.userRepository.delete({ user_id: id });

      const userWithoutPassword = { ...user };
      delete (userWithoutPassword).user_password;
      delete (userWithoutPassword).reset_password_token;
      delete (userWithoutPassword).user_image;

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


  async findUserByResetPasswordToken(resetPasswordToken: string): Promise<HttpException | User> {
    try {
      const user = await this.userRepository.findOne({ where: { reset_password_token: resetPasswordToken } });
      if (!user) {
        return new HttpException('User not found', HttpStatus.NOT_FOUND);
      };

      return user;

    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getProfileImage(userId: number): Promise<HttpException | { userId: number; urlImage: string; }> {
    try {
      const user = await this.userRepository.findOne({ where: { user_id: userId } });
      if (!user) {
        return new HttpException('User does not exist', HttpStatus.NOT_FOUND);
      };

      const imageDefault = "default-image-user/default-image-user.jpg"
      let imagePath = `profile-images/${userId}`

      if (user.user_image == imageDefault) {
        imagePath = imageDefault
      }

      const urlImage = await this.imageService.getPublicUrl(imagePath);

      return { userId, urlImage };
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async uploadProfileImage(userId: number, file): Promise<HttpException | { userId: number; urlImage: string; }> {
    try {
      const user = await this.userRepository.findOne({ where: { user_id: userId } });
      if (!user) {
        return new HttpException('User does not exist', HttpStatus.NOT_FOUND);
      };
      const imagePath = await this.imageService.uploadImage(file, `profile-images/${userId}`);

      user.user_image = imagePath;
      const urlImage = await this.imageService.getPublicUrl(imagePath);
      await this.userRepository.update(userId, user);
      return { userId, urlImage };

    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteProfileImage(userId: number): Promise<HttpException | { userId: number; message: string; }> {
    try {
      const user = await this.userRepository.findOne({ where: { user_id: userId } });
      if (!user) {
        return new HttpException('User does not exist', HttpStatus.NOT_FOUND);
      };
      const imageDefault = "default-image-user/default-image-user.jpg"

      if (user.user_image == imageDefault) {
        return new HttpException('This user does not have a profile image', HttpStatus.CONFLICT);
      }

      const imagePath = `profile-images/${userId}`
      await this.imageService.deleteImage(imagePath)
      user.user_image = imageDefault;
      await this.userRepository.update(userId, user);

      return {
        userId: userId,
        message: "User profile image successfully deleted"
      };

    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
