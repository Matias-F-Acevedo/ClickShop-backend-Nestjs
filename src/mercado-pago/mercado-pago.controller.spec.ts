import { Test, TestingModule } from '@nestjs/testing';
import { MercadoPagoController } from './mercado-pago.controller';
import { MercadoPagoService } from './mercado-pago.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { ItemsArrayDto } from './dto/items-array.dto';
import { PreferenceResponse } from 'mercadopago/dist/clients/preference/commonTypes';

describe('MercadoPagoController', () => {
  let controller: MercadoPagoController;
  let service: MercadoPagoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        JwtModule.register({ secret: 'test-secret' }),
      ],
      controllers: [MercadoPagoController],
      providers: [
        MercadoPagoService,
        ConfigService,
        JwtService,
        AuthGuard,
      ],
    }).compile();

    controller = module.get<MercadoPagoController>(MercadoPagoController);
    service = module.get<MercadoPagoService>(MercadoPagoService);
  });

  describe('createPreference', () => {
    it('should create a preference and return it', async () => {
      const itemsArrayDto: ItemsArrayDto = { items: [{ id: '123', title: 'Product 1', quantity: 1, currency_id: 'ARS', unit_price: 100 }] };
      const mockPreference  = { id: 'preference123', items: itemsArrayDto.items} as PreferenceResponse;

      jest.spyOn(service, 'createPreference').mockResolvedValue({preference: mockPreference});

      const result = await controller.createPreference(itemsArrayDto);

      expect(service.createPreference).toHaveBeenCalledWith(itemsArrayDto.items);
      expect(result).toEqual({preference: mockPreference});
    });

    it('should throw an error if createPreference fails', async () => {
      const itemsArrayDto: ItemsArrayDto = { items: [{ id: '123', title: 'Product 1', quantity: 1, currency_id: 'ARS', unit_price: 100 }] };

      jest.spyOn(service, 'createPreference').mockImplementation(async () => { return new HttpException('INTERNAL SERVER ERROR', HttpStatus.INTERNAL_SERVER_ERROR) });
     
      const result = await controller.createPreference(itemsArrayDto);

      expect(service.createPreference).toHaveBeenCalledWith(itemsArrayDto.items);
      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('status', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
