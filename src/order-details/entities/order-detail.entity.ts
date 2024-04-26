import { Order } from 'src/order/entities/order.entity';
import { Products } from 'src/products/entities/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn} from 'typeorm';

@Entity()
export class OrderDetail {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    order_id: number;

    @Column()
    product_id: number;

    @Column()
    quantity: number;

    @Column({type: 'decimal', precision: 10, scale: 2})
    unitPrice: number;
    
    @Column({type: 'decimal', precision: 10, scale: 2})
    subtotal: number;

    @ManyToOne(() => Order, order => order.orderDetail,{onDelete: "CASCADE"})
    @JoinColumn({ name:'order_id'}) 
    order: Order;

 
    @OneToOne(()=> Products)
    @JoinColumn({name:'product_id'})
    product:Products

}
