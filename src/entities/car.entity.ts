import { TimestampMetadata } from 'src/generics/timestamp.metadata';
import { RequestEntity } from 'src/entities/request.entity';
import { UserEntity } from 'src/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity('car')
export class CarEntity extends TimestampMetadata {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  model: string;

  @Column()
  brand: string;

  @Column()
  year: number;

  @Column()
  motor: string;

  @Column()
  mileage: string;

  @Column()
  box: string;

  @Column()
  price_with_driver: number;

  @Column()
  price_no_driver: number;

  @Column()
  image1: string;

  @Column()
  image2: string;

  @Column()
  image3: string;

  @Column()
  image4: string;

  @Column()
  type: string;

  @ManyToOne((type) => UserEntity, (user) => user.cars, {
    cascade: ['insert', 'update'],
    nullable: true,
    eager: true,
  })
  createBy: UserEntity;

  @OneToMany((type) => RequestEntity, (request) => request.car, {
    nullable: true,
    cascade: true,
  })
  requests: RequestEntity[];
}
