// mercado-pago.service.ts
import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';

@Injectable()
export class MercadoPagoService {
  private client: MercadoPagoConfig;

  constructor() {
    this.client = new MercadoPagoConfig({
      accessToken: 'TEST-2205321052646983-031401-2694b3d7dc2293be7c162bec2fee429e-1725358919'
    });
  }

  async createPreference(items: any[]): Promise<any> {
    const preference = new Preference(this.client);

    try {
      const response = await preference.create({
        body: {
          items: items,
        },
      });

      

      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  } 
}
