import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { ItemDto } from './dto/create-item.dto';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';

@Injectable()
export class MercadoPagoService {
  private client: MercadoPagoConfig;

  constructor(private configService: ConfigService) {
    this.client = new MercadoPagoConfig({
      accessToken: this.configService.get<string>('config.mercadoPago_access_token')
    });
  }

  async createPreference(items: ItemDto[]): Promise<{ preference: PreferenceResponse } | HttpException> {
    try {
      const preference = new Preference(this.client);
      const response = await preference.create({
        body: {
          items: items,
        },
      });

      return { preference: response };
    } catch (error) {
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 
