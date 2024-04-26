import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';



@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
  ) {}

  async create(categoryDto: CreateCategoryDto): Promise<HttpException | Category> {

    try {
      const { name, description } = categoryDto;
      // Verificar si ya existe una categoría con el mismo nombre
      const existingCategory = await this.categoryRepository.findOne({ where: { name } });
      if (existingCategory) {
        return new HttpException('Category with this name already exists', HttpStatus.CONFLICT);
      }
      // Crear la nueva categoría
      const newCategory = this.categoryRepository.create({ name, description });
      return this.categoryRepository.save(newCategory);
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async findAll(): Promise<HttpException | Category[]> {
    try {
      const categories = await this.categoryRepository.find();
      return categories;
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  async findOne(id: number): Promise<HttpException | Category> {
    try {
      // Buscar la categoría por su ID
      const category = await this.categoryRepository.findOne({ where: { id: id } });

      if (!category) {
        return new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }
      return category;
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {

    try {
      // Buscar la categoría por su ID
      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category) {
        return new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      if (updateCategoryDto.name) {
        const existingCategory = await this.categoryRepository.findOne({ where: { name: updateCategoryDto.name } });
        if (existingCategory) {
          return new HttpException('Category with this name already exists', HttpStatus.CONFLICT);
        }
      }
      return this.categoryRepository.save({ ...category, ...updateCategoryDto });
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async remove(id: number) {
    try {
      // Buscar la categoría por su ID
      const category = await this.categoryRepository.findOne({ where: { id }, relations: ['product'] });
      
      if (!category) {
        return new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }
      // verificar si hay productos asociados
      if (category.product && category.product.length > 0) {
        return new HttpException('There are products associated with this category. Please delete the products first.', HttpStatus.BAD_REQUEST);
      }
      // Eliminar la categoría
      return this.categoryRepository.remove(category);

    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
