import { Test, TestingModule } from '@nestjs/testing';
import { MercadoPagoService } from './mercado-pago.service';
import { ConfigService } from '@nestjs/config';
import { Preference, MercadoPagoConfig } from 'mercadopago';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ItemDto } from './dto/create-item.dto';

jest.mock('mercadopago', () => {
  const mPreference = {
    create: jest.fn(),
  };
  return {
    MercadoPagoConfig: jest.fn().mockImplementation(config => config),
    Preference: jest.fn().mockImplementation(() => mPreference),
  };
});

describe('MercadoPagoService', () => {
  let service: MercadoPagoService;
  let mockPreference: { create: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MercadoPagoService,
        ConfigService,
      ],
    }).compile();

    service = module.get<MercadoPagoService>(MercadoPagoService);
    const configService = module.get<ConfigService>(ConfigService);

    jest.spyOn(configService, 'get').mockReturnValue('TEST-ACCESS-TOKEN');

    const mercadoPagoConfig = new MercadoPagoConfig({
      accessToken: configService.get<string>('config.mercadoPago_access_token'),
    });

    mockPreference = new Preference(mercadoPagoConfig) as any;
  });

  describe('createPreference', () => {
    it('should create a preference and return the response', async () => {
      const items: ItemDto[] = [{ id: '123', title: 'Product 1', quantity: 1, currency_id: 'ARS', unit_price: 100 }];
      const mockResponse = { id: 'preference123', items };

      mockPreference.create.mockResolvedValue(mockResponse);

      const result = await service.createPreference(items);

      expect(mockPreference.create).toHaveBeenCalledWith({
        body: { items },
      });
      expect(result).toEqual({ preference: mockResponse });
    });

    it('should throw an error if createPreference fails', async () => {
      const items: ItemDto[] = [{ id: '123', title: 'Product 1', quantity: 1, currency_id: 'ARS', unit_price: 100 }];
      const errorMessage = 'Error creating preference';

      mockPreference.create.mockRejectedValue(new Error(errorMessage));

      const result = await service.createPreference(items)

      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
