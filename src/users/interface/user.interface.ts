import { Products } from "src/products/entities/product.entity";



export interface UserInterface {

    user_id:number;
    user_name: string;
    user_lastname: string;
    user_phoneNumber: string;
    user_address: string;
    user_identificationNumber: string;
    user_email: string;
    user_createdAt: Date;
    user_image:string,
}