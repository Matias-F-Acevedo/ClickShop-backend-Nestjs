import { Test, TestingModule } from '@nestjs/testing';
import { MercadoPagoService } from './mercado-pago.service';
import { MercadoPagoConfig, Preference } from 'mercadopago';

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
      providers: [MercadoPagoService],
    }).compile();

    service = module.get<MercadoPagoService>(MercadoPagoService);

    const mercadoPagoConfig = new MercadoPagoConfig({
      accessToken: 'TEST-2205321052646983-031401-2694b3d7dc2293be7c162bec2fee429e-1725358919',
    });


    mockPreference = new Preference(mercadoPagoConfig) as any;
  });

  describe('createPreference', () => {
    it('should create a preference and return the response', async () => {
      const items = [{ id: '123', title: 'Product 1', quantity: 1, currency_id: 'ARS', unit_price: 100 }];
      const mockResponse = { id: 'preference123', items };

      mockPreference.create.mockResolvedValue(mockResponse);

      const result = await service.createPreference(items);

      expect(mockPreference.create).toHaveBeenCalledWith({
        body: { items: items },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if createPreference fails', async () => {
      const items = [{ id: '123', title: 'Product 1', quantity: 1, currency_id: 'ARS', unit_price: 100 }];
      const errorMessage = 'Error creating preference';

      mockPreference.create.mockRejectedValue(new Error(errorMessage));

      await expect(service.createPreference(items)).rejects.toThrow(errorMessage);
    });
  });
});
