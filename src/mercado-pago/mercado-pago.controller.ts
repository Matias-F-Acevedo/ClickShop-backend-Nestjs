import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MercadoPagoService } from './mercado-pago.service';
import {ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('mercado-pago')
@ApiBearerAuth()
@Controller('mercado-pago')
export class MercadoPagoController {
  constructor(private readonly mercadoPagoService: MercadoPagoService) {}


  @UseGuards(AuthGuard)
  @Post('create-preference')
  async createPreference(@Body() items: any[]): Promise<any> {
    try {
      const preference = await this.mercadoPagoService.createPreference(items);
      return { preference: preference };
    } catch (error) {
      throw new Error(`Error al crear preferencia en el controlador: ${error.message}`);
    }
  }
}
