import { Body, Controller, Delete, Get, HttpException,Param, ParseIntPipe, Patch, Post, UseGuards} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  
  @Get()
  findAll(): Promise<HttpException | Category[]> {
    return this.categoryService.findAll();
  }
  
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: string): Promise<HttpException | Category> {
    return await this.categoryService.findOne(+id);
  }
  
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() newCategory: CreateCategoryDto) {
    return this.categoryService.create(newCategory);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return await this.categoryService.update(+id, updateCategoryDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string) {
    return await this.categoryService.remove(+id);

  }
}
