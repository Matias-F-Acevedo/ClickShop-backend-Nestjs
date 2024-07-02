import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItems } from './entities/cart-items.entity';
import { Order, OrderStatus } from 'src/order/entities/order.entity';
import { OrderDetail } from 'src/order-details/entities/order-detail.entity';
import { ProductsService } from 'src/products/products.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateCartItemsDto } from './dto/create-cart-items.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { ProductCondition, Products } from 'src/products/entities/product.entity';

describe('CartService', () => {
  let service: CartService;
  let cartRepository: Repository<Cart>;
  let cartItemsRepository: Repository<CartItems>;
  let orderRepository: Repository<Order>;
  let orderDetailRepository: Repository<OrderDetail>;
  let productsService: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(Cart),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(CartItems),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Order),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(OrderDetail),
          useClass: Repository,
        },
        {
          provide: ProductsService,
          useValue: {
            findOne: jest.fn(),
            getProductImages: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get<Repository<Cart>>(getRepositoryToken(Cart));
    cartItemsRepository = module.get<Repository<CartItems>>(getRepositoryToken(CartItems));
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    orderDetailRepository = module.get<Repository<OrderDetail>>(getRepositoryToken(OrderDetail));
    productsService = module.get<ProductsService>(ProductsService);
  });

  describe('getAllCartItems', () => {
    it('should return cart items if cart exists', async () => {
      const userId = 1;
      const cart = { cart_id: 1 } as Cart;
      const cartItems = [
        { 
          cartItem_id: 1,
          cart_id: 1,
          product_id: 1,
          quantity: 1,
          product: { isActive: true, createdAt: new Date(), category_id: 1, condition: ProductCondition.NEW, productId: 1 } 
        }
      ] as CartItems[];

      const mockImageProduct = {productId: 1 ,urlImage: ['http://image-url.com/image1.jpg'] };

      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(cart);
      jest.spyOn(cartItemsRepository, 'find').mockResolvedValue(cartItems);
      jest.spyOn(productsService, 'getProductImages').mockResolvedValue(mockImageProduct);

      const result = await service.getAllCartItems(userId);
      const expectedCartItem = {
        ...cartItems[0],
        product: {
          productId: 1,
          isActive: true,
          product_image: mockImageProduct.urlImage[0]
        }
      };
      expect(result).toEqual([expectedCartItem]);
    });

    it('should return HttpException if cart does not exist', async () => {
      const userId = 1;

      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(null);

      const result = await service.getAllCartItems(userId);
      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('should handle HttpException from getProductImages', async () => {
      const userId = 1;
      const cart = { cart_id: 1 } as Cart;
      const cartItems = [
        { 
          cartItem_id: 1,
          cart_id: 1,
          product_id: 1,
          quantity: 1,
          product: { isActive: true, createdAt: new Date(), category_id: 1, condition: ProductCondition.NEW, productId: 1 } 
        }
      ] as CartItems[];

      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(cart);
      jest.spyOn(cartItemsRepository, 'find').mockResolvedValue(cartItems);
      jest.spyOn(productsService, 'getProductImages').mockResolvedValue(new HttpException('Image not found', HttpStatus.NOT_FOUND));

      const result = await service.getAllCartItems(userId);
      const expectedCartItem = {
        ...cartItems[0],
        product: {
          productId: 1,
          isActive: true
          // no hay product_image porque getProductImages devolvio un error
        }
      };
      expect(result).toEqual([expectedCartItem]);
    });

    it('should throw HttpException if an error occurs', async () => {
      const userId = 1;

      jest.spyOn(cartRepository, 'findOne').mockRejectedValue(new Error('Database error'));

      await expect(service.getAllCartItems(userId)).rejects.toThrow(HttpException);
      await expect(service.getAllCartItems(userId)).rejects.toThrow('Error getting cart items');
    });
  });


  describe('findOneByUserId', () => {
    it('should return the cart if it exists', async () => {
      const userId = 1;
      const cart = { user_id: userId, cartItems: [] } as Cart;

      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(cart);

      const result = await service.findOneByUserId(userId);
      expect(result).toEqual(cart);
    });

    it('should return HttpException if cart does not exist', async () => {
      const userId = 1;

      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(null);

      const result = await service.findOneByUserId(userId);
      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return HttpException if there is a database error', async () => {
      const userId = 1;

      jest.spyOn(cartRepository, 'findOne').mockRejectedValue(new Error());

      const result = await service.findOneByUserId(userId);
      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('addItemToCart', () => {
    it('should add an item to the cart successfully', async () => {
      const userId = 1;
      const createCartItemsDto: CreateCartItemsDto = { product_id: 1, quantity: 1, unitPrice: 100 };
      const cart = { cart_id: 1 } as Cart;
      const product = {} as Products;
      const newCartItem = { cart_id: cart.cart_id, product_id: createCartItemsDto.product_id, quantity: createCartItemsDto.quantity, unitPrice: createCartItemsDto.unitPrice, subtotal: createCartItemsDto.unitPrice * createCartItemsDto.quantity } as CartItems;

      jest.spyOn(service, 'findOneByUserId').mockResolvedValue(cart);
      jest.spyOn(productsService, 'findOne').mockResolvedValue(product);
      jest.spyOn(cartItemsRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(cartItemsRepository, 'create').mockReturnValue(newCartItem);
      jest.spyOn(cartItemsRepository, 'save').mockResolvedValue(newCartItem);
      jest.spyOn(service, 'updateCartTotal').mockResolvedValue();
      const result = await service.addItemToCart(userId, createCartItemsDto);
      expect(result).toEqual(newCartItem);
    });

    it('should return HttpException if cart does not exist', async () => {
      const userId = 1;
      const createCartItemsDto: CreateCartItemsDto = { product_id: 1, quantity: 1, unitPrice: 100 };

      jest.spyOn(service, 'findOneByUserId').mockResolvedValue(new HttpException('The cart does not exist', HttpStatus.NOT_FOUND));

      const result = await service.addItemToCart(userId, createCartItemsDto);
      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return HttpException if product does not exist', async () => {
      const userId = 1;
      const createCartItemsDto: CreateCartItemsDto = { product_id: 1, quantity: 1, unitPrice: 100 };
      const cart = { cart_id: 1 } as Cart;

      jest.spyOn(service, 'findOneByUserId').mockResolvedValue(cart);
      jest.spyOn(productsService, 'findOne').mockResolvedValue(new HttpException('The product does not exist', HttpStatus.NOT_FOUND));

      const result = await service.addItemToCart(userId, createCartItemsDto);
      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return HttpException if cart item already exists', async () => {
      const userId = 1;
      const createCartItemsDto: CreateCartItemsDto = { product_id: 1, quantity: 1, unitPrice: 100 };
      const cart = { cart_id: 1 } as Cart;
      const product = {} as Products;
      const existingCartItem = { cart_id: cart.cart_id, product_id: createCartItemsDto.product_id } as CartItems;

      jest.spyOn(service, 'findOneByUserId').mockResolvedValue(cart);
      jest.spyOn(productsService, 'findOne').mockResolvedValue(product);
      jest.spyOn(cartItemsRepository, 'findOne').mockResolvedValue(existingCartItem);

      const result = await service.addItemToCart(userId, createCartItemsDto);
      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).getStatus()).toBe(HttpStatus.CONFLICT);
    });
  });

  describe('updateCartItemQuantity', () => {
    it('should update the quantity of a cart item successfully', async () => {
      const userId = 1;
      const cartItemId = 1;
      const newQuantity = 3;
      const cart = { cart_id: 1 } as Cart;
      const cartItem = { cartItem_id: cartItemId, cart_id: cart.cart_id, quantity: 1, unitPrice: 100, subtotal: 100 } as CartItems;
      const updatedCartItem = { ...cartItem, quantity: newQuantity, subtotal: newQuantity * cartItem.unitPrice } as CartItems;

      jest.spyOn(service, 'findOneByUserId').mockResolvedValue(cart);
      jest.spyOn(cartItemsRepository, 'findOne').mockResolvedValue(cartItem);
      jest.spyOn(cartItemsRepository, 'save').mockResolvedValue(updatedCartItem);
      jest.spyOn(service, 'updateCartTotal').mockResolvedValue();

      const result = await service.updateCartItemQuantity(userId, cartItemId, newQuantity);
      expect(result).toEqual(updatedCartItem);
    });

    it('should return HttpException if cart does not exist', async () => {
      const userId = 1;
      const cartItemId = 1;
      const newQuantity = 3;

      jest.spyOn(service, 'findOneByUserId').mockResolvedValue(new HttpException('The cart does not exist', HttpStatus.NOT_FOUND));

      const result = await service.updateCartItemQuantity(userId, cartItemId, newQuantity);
      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return HttpException if cart item does not exist', async () => {
      const userId = 1;
      const cartItemId = 1;
      const newQuantity = 3;
      const cart = { cart_id: 1 } as Cart;

      jest.spyOn(service, 'findOneByUserId').mockResolvedValue(cart);
      jest.spyOn(cartItemsRepository, 'findOne').mockResolvedValue(null);

      const result = await service.updateCartItemQuantity(userId, cartItemId, newQuantity);
      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).getStatus()).toBe(HttpStatus.CONFLICT);
    });

    it('should return HttpException on internal server error', async () => {
      const userId = 1;
      const cartItemId = 1;
      const newQuantity = 3;
      const cart = { cart_id: 1 } as Cart;
      const cartItem = { cartItem_id: cartItemId, cart_id: cart.cart_id, quantity: 1, unitPrice: 100, subtotal: 100 } as CartItems;

      jest.spyOn(service, 'findOneByUserId').mockResolvedValue(cart);
      jest.spyOn(cartItemsRepository, 'findOne').mockResolvedValue(cartItem);
      jest.spyOn(cartItemsRepository, 'save').mockRejectedValue(new Error());

      const result = await service.updateCartItemQuantity(userId, cartItemId, newQuantity);
      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });
  });


  describe('removeCartItem', () => {
    it('should remove a cart item successfully', async () => {
      const userId = 1;
      const cartItemId = 1;
      const cart = { cart_id: 1 } as Cart;
      const cartItem = { cartItem_id: cartItemId, cart_id: cart.cart_id } as CartItems;

      jest.spyOn(service, 'findOneByUserId').mockResolvedValue(cart);
      jest.spyOn(cartItemsRepository, 'findOne').mockResolvedValue(cartItem);
      jest.spyOn(cartItemsRepository, 'delete').mockResolvedValue(undefined);
      jest.spyOn(service, 'updateCartTotal').mockResolvedValue();

      const result = await service.removeCartItem(userId, cartItemId);
      expect(result).toEqual(cartItem);
    });

    it('should return HttpException if cart does not exist', async () => {
      const userId = 1;
      const cartItemId = 1;

      jest.spyOn(service, 'findOneByUserId').mockResolvedValue(new HttpException('The cart does not exist', HttpStatus.NOT_FOUND));

      const result = await service.removeCartItem(userId, cartItemId);
      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return HttpException if cart item does not exist', async () => {
      const userId = 1;
      const cartItemId = 1;
      const cart = { cart_id: 1 } as Cart;

      jest.spyOn(service, 'findOneByUserId').mockResolvedValue(cart);
      jest.spyOn(cartItemsRepository, 'findOne').mockResolvedValue(null);

      const result = await service.removeCartItem(userId, cartItemId);
      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return HttpException on internal server error', async () => {
      const userId = 1;
      const cartItemId = 1;
      const cart = { cart_id: 1 } as Cart;
      const cartItem = { cartItem_id: cartItemId, cart_id: cart.cart_id } as CartItems;

      jest.spyOn(service, 'findOneByUserId').mockResolvedValue(cart);
      jest.spyOn(cartItemsRepository, 'findOne').mockResolvedValue(cartItem);
      jest.spyOn(cartItemsRepository, 'delete').mockRejectedValue(new Error());

      const result = await service.removeCartItem(userId, cartItemId);
      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('removeAllCartItem', () => {
    it('should remove all cart items successfully', async () => {
      const userId = 1;
      const cart = { cart_id: 1 } as Cart;
      const cartItems = [{ cart_id: cart.cart_id }] as CartItems[];

      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(cart);
      jest.spyOn(cartItemsRepository, 'find').mockResolvedValue(cartItems);
      jest.spyOn(cartItemsRepository, 'delete').mockResolvedValue(undefined);
      jest.spyOn(service, 'updateCartTotal').mockResolvedValue();

      const result = await service.removeAllCartItem(userId);
      expect(result).toEqual(cartItems);
    });

    it('should return HttpException if cart does not exist', async () => {
      const userId = 1;

      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(null);

      const result = await service.removeAllCartItem(userId);
      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return HttpException on internal server error', async () => {
      const userId = 1;
      const cart = { cart_id: 1 } as Cart;

      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(cart);
      jest.spyOn(cartItemsRepository, 'find').mockRejectedValue(new Error());

      const result = await service.removeAllCartItem(userId);
      expect(result).toBeInstanceOf(HttpException);
      expect((result as HttpException).getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });


  describe('checkout', () => {
    it('should checkout successfully', async () => {
      const userId = 1;
      const createAddressDto: CreateAddressDto = {
        shippingAddress: '123 Street',
        city: 'City',
        province: 'Province',
        postalCode: '12345',
        country: 'Country',
      };
      const cart = { cart_id: 1, cartItems: [{ product_id: 1, quantity: 1, unitPrice: 100, subtotal: 100 }] } as Cart;

      const order = {
        ...createAddressDto,
        user_id: userId,
        status: OrderStatus.PENDING,
        date: new Date(),
        total: 100
      } as Order;

      const orderDetail = {
        order,
        product_id: 1,
        quantity: 1,
        unitPrice: 100,
        subtotal: 100
      } as OrderDetail;

      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(cart);
      jest.spyOn(orderRepository, 'save').mockImplementation(async (order: Order) => {
        return {
          ...order,
          date: order.date.toISOString(),
        } as unknown as Order; 
      });
      jest.spyOn(orderDetailRepository, 'save').mockResolvedValue(orderDetail);
      jest.spyOn(service, 'removeAllCartItem').mockResolvedValue([] as CartItems[]);

      const result = await service.checkout(userId, createAddressDto);

      let resultData
      if (!(result instanceof HttpException)){
          resultData = {
          ...result,
          date: result.date.toISOString(),
        };
      }
      expect(resultData).toEqual(expect.objectContaining({
        ...order,
        date: expect.any(String),
      }));
    });

    it('should return HttpException if cart does not exist', async () => {
      const userId = 1;
      const createAddressDto: CreateAddressDto = {
        shippingAddress: '123 Street',
        city: 'City',
        province: 'Province',
        postalCode: '12345',
        country: 'Country',
      };

      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(null);
      const result = await service.checkout(userId, createAddressDto)


      expect(result).toBeInstanceOf(HttpException);
      expect(result).toHaveProperty('message', 'Cart or items not found');
      expect(result).toHaveProperty('status', HttpStatus.NOT_FOUND);
    });

    it('should return HttpException on internal server error', async () => {
      const userId = 1;
      const createAddressDto: CreateAddressDto = {
        shippingAddress: '123 Street',
        city: 'City',
        province: 'Province',
        postalCode: '12345',
        country: 'Country',
      };
      const cart = { cart_id: 1, cartItems: [{ product_id: 1, quantity: 1, unitPrice: 100, subtotal: 100 }] } as Cart;

      jest.spyOn(cartRepository, 'findOne').mockResolvedValue(cart);
      jest.spyOn(orderRepository, 'save').mockRejectedValue(new Error());

      await expect(service.checkout(userId, createAddressDto)).rejects.toThrow(HttpException);
      await expect(service.checkout(userId, createAddressDto)).rejects.toThrow('Error checking out');


    });
  });

  describe('updateCartTotal', () => {
    it('should update the total of the cart successfully', async () => {
      const cartId = 1;
      const cartItems = [
        { subtotal: 100, quantity: 2 },
        { subtotal: 200, quantity: 3 },
      ] as CartItems[];
    
      const total = cartItems.reduce((sum, item) => sum + (+item.subtotal), 0);
      const quantityTotal = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
      jest.spyOn(cartItemsRepository, 'find').mockResolvedValue(cartItems);
      const updateSpy = jest.spyOn(cartRepository, 'update').mockResolvedValue(undefined);
    
      await service.updateCartTotal(cartId);
    
      expect(cartItemsRepository.find).toHaveBeenCalledWith({ where: { cart_id: cartId } });
      expect(updateSpy).toHaveBeenCalledWith(cartId, { total, quantityTotal });
    });
    
    it('should throw HttpException if an error occurs when retrieving cart items', async () => {
      const cartId = 1;

      jest.spyOn(cartItemsRepository, 'find').mockRejectedValue(new Error());

      await expect(service.updateCartTotal(cartId)).rejects.toThrow(HttpException);
      await expect(service.updateCartTotal(cartId)).rejects.toThrow('error updating cart total');
    });

    it('should throw HttpException if an error occurs when updating the cart', async () => {
      const cartId = 1;
      const cartItems = [
        { subtotal: 100 },
        { subtotal: 200 },
      ] as CartItems[];
      const total = cartItems.reduce((sum, item) => sum + (+item.subtotal), 0);

      jest.spyOn(cartItemsRepository, 'find').mockResolvedValue(cartItems);
      jest.spyOn(cartRepository, 'update').mockRejectedValue(new Error());

      await expect(service.updateCartTotal(cartId)).rejects.toThrow(HttpException);
      await expect(service.updateCartTotal(cartId)).rejects.toThrow('error updating cart total');
    });
  });
});
