import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { MercadoPagoService } from './mercado-pago.service';
import {ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { ItemsArrayDto } from './dto/items-array.dto';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';

@ApiTags('mercado-pago')
@ApiBearerAuth()
@Controller('mercado-pago')
export class MercadoPagoController {
  constructor(private readonly mercadoPagoService: MercadoPagoService) {}


  @UseGuards(AuthGuard)
  @Post('create-preference')
  async createPreference(@Body() itemsArrayDto: ItemsArrayDto): Promise<{preference: PreferenceResponse} | HttpException> {
    return await this.mercadoPagoService.createPreference(itemsArrayDto.items);
  }
}
