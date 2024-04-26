import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class UpdateCartDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  newProductId: number;
}
