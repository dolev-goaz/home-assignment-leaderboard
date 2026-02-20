import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    userId: string;

    @Column("varchar", { length: 255 })
    name: string;

    @Column("int")
    score: number;
}
