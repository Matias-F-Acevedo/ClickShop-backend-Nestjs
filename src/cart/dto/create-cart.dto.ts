import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCartDto {
  @IsNotEmpty()
  userId: number;

  @IsOptional()
  productId: number;
}

