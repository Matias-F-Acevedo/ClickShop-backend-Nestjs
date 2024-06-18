import { Products } from "src/products/entities/product.entity";
import { Cart } from "../entities/cart.entity";

export interface CartItemsInterface {
    cartItem_id: number;
    cart_id: number;
    product_id: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    cart?: Cart; 
    products?: Products[];
  }