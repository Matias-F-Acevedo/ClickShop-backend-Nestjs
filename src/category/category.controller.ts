import { Body, Controller, Delete, Get, HttpException,Param, ParseIntPipe, Patch, Post} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  
  @Get()
  findAll(): Promise<HttpException | Category[]> {
    return this.categoryService.findAll();
  }
  
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<HttpException | Category> {
    return await this.categoryService.findOne(id);
  }
  
  @Post()
  async create(@Body() newCategory: CreateCategoryDto) {
    return this.categoryService.create(newCategory);
  }


  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return await this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.remove(id);

  }
}
