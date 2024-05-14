import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserInterface } from './interface/user.interface';
import { AuthGuard } from 'src/auth/auth.guard';
import { CartService } from 'src/cart/cart.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  // habilita la transformacion del objeto al tipo del DTO antes de usarlo en la logica.
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createUserDto: CreateUserDto): Promise<HttpException | UserInterface> {
    return this.usersService.create(createUserDto);
  }


  // @UseGuards(AuthGuard)
  @Get()
  findAll(): Promise<UserInterface[] | HttpException > {
    return this.usersService.findAll();
  }
  // @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<HttpException |UserInterface>  {
    return this.usersService.findOne(+id);
  }
  // @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto):Promise<HttpException | UserInterface> {
    return this.usersService.update(+id, updateUserDto);
  }
  // @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string):Promise<HttpException | UserInterface> {
    return this.usersService.remove(+id);
  }
}


