import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { ItemDto } from './dto/create-item.dto';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';

@Injectable()
export class MercadoPagoService {
  private client: MercadoPagoConfig;
  private readonly logger = new Logger(MercadoPagoService.name);

  constructor(private configService: ConfigService) {
    this.client = new MercadoPagoConfig({
      accessToken: 'APP_USR-2205321052646983-031401-ef2fe1fed87b01b345649cb3f76803b3-1725358919',
    });
  }

  async createPreference(items: ItemDto[]): Promise<{ preference: PreferenceResponse } | HttpException> {
    try {
      const preference = new Preference(this.client);
      // this.logger.log(`Creating preference with items: ${JSON.stringify(items)}`);
      const response = await preference.create({
        body: {
          items: items,
        },
      });
      // this.logger.log(`Preference created successfully: ${JSON.stringify(response)}`);
      return { preference: response };
    } catch (error) {
      // this.logger.error(`Error creating preference: ${error.message}`);
      return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 
