import { ProductCondition } from "../entities/product.entity";



export interface ProductInterface {
    productId: number;

    category_id: number;

    user_id: number;

    product_name: string;

    price: number;

    stock: number;

    description: string;

    condition: ProductCondition;

    product_image:string[] | string;

    createdAt: Date;

    isActive: boolean;

}