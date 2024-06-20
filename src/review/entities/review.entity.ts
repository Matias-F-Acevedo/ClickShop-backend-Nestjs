import { Products } from "src/products/entities/product.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("review")
export class Review {

    @PrimaryGeneratedColumn()
    review_id: number;

    @Column()
    product_id: number;

    @Column()
    user_id: number;

    @Column()
    score: number;

    @Column()
    commentary: string;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    date: Date;


    @ManyToOne(() => Products, product => product.review)
    @JoinColumn({ name: 'product_id' }) 
    product: Products;

    @ManyToOne(() => User, user => user.review,{onDelete: "CASCADE"})
    @JoinColumn({ name: 'user_id' }) 
    user: User;
    
}
