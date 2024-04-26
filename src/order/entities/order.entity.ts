import { OrderDetail } from "src/order-details/entities/order-detail.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

export enum OrderStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    SHIPPED = 'SHIPPED',
    CANCELLED = 'CANCELLED',
}

@Entity("order")
export class Order {

    @PrimaryGeneratedColumn()
    order_id: number;

    @Column()
    user_id: number;

    @Column()
    shippingAddress: string;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    // ejemplo de numero max: 99999999.99
    @Column({ type: 'decimal', precision: 10, scale: 2 }) 
    total: number;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    date: Date;

    @ManyToOne(() => User, user => user.orders, {
        onDelete: "CASCADE"
    }) 
    @JoinColumn({ name: 'user_id' }) 
    user: User;


    
    @OneToMany(() => OrderDetail, orderDetail => orderDetail.order, {cascade: ["remove"] })
    orderDetail: OrderDetail[];
     
}
