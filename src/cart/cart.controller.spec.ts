import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from 'src/auth/auth.guard';
import { CartController } from './cart.controller';
import { CreateCartItemsDto } from './dto/create-cart-items.dto';
import { Cart } from './entities/cart.entity';
import { CartService } from './cart.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { CartItems } from './entities/cart-items.entity';
import { OrderStatus } from 'src/order/entities/order.entity';
import { UpdateCartItemQuantityDto } from './dto/update-cart-item-quantity.dto';




describe('CartController', () => {
  let controller: CartController;
  let service: CartService;


  const mockCart = {
    cart_id: 1,
    user_id: 1,
    total: 12345
  };

  const mockCartItem = {
    cartItem_id: 1,
    cart_id: 1,
    product_id: 1,
    quantity: 2,
    unitPrice: 20,
    subtotal: 40,
  };

  const mockOrder = {
    order_id:1,
    user_id:1,
    shippingAddress: "av libertad 255",
    city: "benito juarez",
    province:"bs as",
    postalCode:"7020",
    country: "argentina",
    status:OrderStatus.PENDING,
    total:34234324
};

const mockAddress = {
  shippingAddress: "av. test",
  city: "TEST",
  province: "Bs. As.",
  postalCode: "2345",
  country: "Argentina",
};


  // jest.fn es una función proporcionada por la biblioteca de pruebas Jest, que se utiliza para crear funciones simuladas (mock functions).

  const mockCartService = {
    getAllCartItems: jest.fn((userId: number) => [mockCartItem]),

    findOneByUserId: jest.fn((user_id: number) => (mockCart)),

    addItemToCart: jest.fn((userId: number, createCartItemsDto: CreateCartItemsDto) => (mockCartItem)),


    updateCartItemQuantity: jest.fn((userId: number, cartItemId: number, newQuantity: number) => (mockCartItem)),


    removeCartItem: jest.fn((userId: number, cartItemId: number) => (mockCartItem)),

    removeAllCartItem: jest.fn((userId: number) => ([mockCartItem])),


    checkout: jest.fn((userId: number, createAddressDto: CreateAddressDto) => (mockOrder)),

  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          // proporciona una implementación simulada del servicio de users
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    })
      // sobrescribe el guard de autenticación AuthGuard
      .overrideGuard(AuthGuard)
      // define un nuevo valor para el guard de autenticación,
      // en este caso, una función simulada que siempre permite la autorización (canActivate siempre devuelve true)
      .useValue({ canActivate: jest.fn(() => true) })
      // compila el módulo de prueba con las configuraciones y sobrescrituras anteriores
      .compile();

    // obtiene una instancia del controlador de usuarios a partir del módulo de prueba compilado
    controller = module.get<CartController>(CartController);
    // obtiene una instancia del servicio de usuarios a partir del módulo de prueba compilado
    service = module.get<CartService>(CartService);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addItemToCart', () => {
    it('should be defined', () => {
      expect(controller.create).toBeDefined();
    });

    it('should create a add item to cart', async () => {
      const userId= "1"
      const createCartItemsDto: CreateCartItemsDto = mockCartItem;
      const result = await controller.create(userId,createCartItemsDto);
      expect(result).toEqual(mockCartItem);
      expect(service.addItemToCart).toHaveBeenCalledWith(1,createCartItemsDto);
    });
  });

  describe('getAllCartItems', () => {
    it('should be defined', () => {
      expect(controller.getAllCartItems).toBeDefined();
    });

    it('should return an array of cartItems', async () => {
      const userId = "1"
      const result = await controller.getAllCartItems(userId);
      expect(result).toEqual([mockCartItem]);
      expect(service.getAllCartItems).toHaveBeenCalledWith(1);
    });

  });


  describe('findOneByUserId', () => {
    it('should be defined', () => {
      expect(controller.findOneByUserId).toBeDefined();
    });

    it('should return a Cart', async () => {
      const userID = '1';
      const result = await controller.findOneByUserId(userID);
      expect(result).toEqual(mockCart);
      expect(service.findOneByUserId).toHaveBeenCalledWith(1);
    });
  });


  

  describe('updateCartItemQuantity', () => {
    it('should be defined', () => {
      expect(controller.updateCartItemQuantity).toBeDefined();
    });

    it('should update CartItem Quantity', async () => {
      const userId = 1;
      const itemId = 1
      const updateCartItemQuantityDto: UpdateCartItemQuantityDto = { quantity: 4 };
      const result = await controller.updateCartItemQuantity(userId, itemId, updateCartItemQuantityDto);
      expect(result).toEqual(mockCartItem);
      expect(service.updateCartItemQuantity).toHaveBeenCalledWith(1, 1,updateCartItemQuantityDto.quantity);
    });
  });

  describe('removeCartItem', () => {
    it('should be defined', () => {
      expect(controller.removeCartItem).toBeDefined();
    });

    it('should remove a CartItem', async () => {
      const userId = 1;
      const itemId = 1

      const result = await controller.removeCartItem(userId, itemId);
      expect(result).toEqual(mockCartItem);
      expect(service.removeCartItem).toHaveBeenCalledWith(1, 1);
    });
  });


  describe('removeAllCartItem', () => {
    it('should be defined', () => {
      expect(controller.removeAllCartItem).toBeDefined();
    });

    it('should remove All CartItem', async () => {
      const userId = 1;
      const result = await controller.removeAllCartItem(userId);
      expect(result).toEqual([mockCartItem]);
      expect(service.removeAllCartItem).toHaveBeenCalledWith(1);
    });
  });


  describe('checkout', () => {
    it('should be defined', () => {
      expect(controller.checkout).toBeDefined();
    });

    it('It should convert the cart into an order with its order data', async () => {
      const userId= "1"
      const createAddressDto: CreateAddressDto = mockAddress
      const result = await controller.checkout(userId,createAddressDto);

      expect(result).toEqual({message: 'Order placed successfully', order: mockOrder});
      expect(service.checkout).toHaveBeenCalledWith(1,createAddressDto);
    });
  });



});