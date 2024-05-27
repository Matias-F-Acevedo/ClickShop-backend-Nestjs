import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Products } from 'src/products/entities/product.entity';

@Entity()
export class Favorite {
    @PrimaryGeneratedColumn()
    fovorite_id: number;

    @Column()
    user_id: number;

    @Column()
    product_id: number;

    @ManyToOne(() => User, user => user.favorites,{onDelete: "CASCADE"})
    @JoinColumn({ name: 'user_id' }) 
    user: User;


    @ManyToOne(() => Products, product => product.favorites)
    @JoinColumn({ name: 'product_id' }) 
    product: Products;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;
}
