import { TimestampMetadata } from 'src/generics/timestamp.metadata';
import { CarEntity } from 'src/entities/car.entity';
import { ClientEntity } from 'src/entities/client.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { RequestStatusPaymentEnum } from 'src/enums/status.enum';

@Entity('request')
export class RequestEntity extends TimestampMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne((type) => CarEntity, (car) => car.requests, {
    cascade: ['insert', 'update'],
    nullable: true,
    eager: true,
  })
  car: CarEntity;

  @CreateDateColumn({
    nullable: true,
    update: true,
  })
  outOfDate: Date;

  @CreateDateColumn({
    nullable: true,
    update: true,
  })
  comeBackDate: Date;

  @Column()
  state: string;

  @Column()
  isDriver: boolean;

  @Column()
  isDelivery: boolean;

  @Column()
  isGoOutCity: boolean;

  @Column({
    type: 'enum',
    enum: RequestStatusPaymentEnum,
    default: RequestStatusPaymentEnum.NOT_INITIATED,
  })
  statusPayment: string;

  @ManyToOne((type) => ClientEntity, (client) => client.requests, {
    cascade: ['insert', 'update'],
    nullable: true,
    eager: true,
  })
  client: ClientEntity;

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }
}
