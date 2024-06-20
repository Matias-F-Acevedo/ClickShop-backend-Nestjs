import { Test, TestingModule } from '@nestjs/testing';
import { MercadoPagoController } from './mercado-pago.controller';
import { MercadoPagoService } from './mercado-pago.service';

describe('MercadoPagoController', () => {
  let controller: MercadoPagoController;
  let service: MercadoPagoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MercadoPagoController],
      providers: [
        {
          provide: MercadoPagoService,
          useValue: {
            createPreference: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MercadoPagoController>(MercadoPagoController);
    service = module.get<MercadoPagoService>(MercadoPagoService);
  });

  describe('createPreference', () => {
    it('should create a preference and return it', async () => {
      const items = [{ id: '123', title: 'Product 1', quantity: 1, currency_id: 'ARS', unit_price: 100 }];
      const mockPreference = { id: 'preference123', items };
      
      jest.spyOn(service, 'createPreference').mockResolvedValue(mockPreference);

      const result = await controller.createPreference(items);
      
      expect(service.createPreference).toHaveBeenCalledWith(items);
      expect(result).toEqual({ preference: mockPreference });
    });

    it('should throw an error if createPreference fails', async () => {
      const items = [{ id: '123', title: 'Product 1', quantity: 1, currency_id: 'ARS', unit_price: 100 }];
      const errorMessage = 'Error creating preference';
      
      jest.spyOn(service, 'createPreference').mockRejectedValue(new Error(errorMessage));

      await expect(controller.createPreference(items)).rejects.toThrow(`Error al crear preferencia en el controlador: ${errorMessage}`);
    });
  });
});
