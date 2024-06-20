import { Controller, Post, Body } from '@nestjs/common';
import { MercadoPagoService } from './mercado-pago.service';

@Controller('mercado-pago')
export class MercadoPagoController {
  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

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
