import { TimestampMetadata } from 'src/generics/timestamp.metadata';
import {
  Column,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';
import { TransactionStatusEnum } from 'src/enums/status.enum';
import { RequestEntity } from './request.entity';

@Entity('transaction')
export class TransactionEntity extends TimestampMetadata {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 10,
  })
  lang: string;

  @Column({
    length: 5,
  })
  currency: string;

  @Column()
  channel: string;

  @Column()
  reference: string;

  @Column()
  country_code: string;

  @Column({ nullable: true, type: 'longtext' })
  response: string;

  @Column()
  requestId: string;

  @Column()
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionStatusEnum,
    default: TransactionStatusEnum.PENDING,
  })
  status: string;

  @OneToOne(() => RequestEntity)
  @JoinColumn()
  request: RequestEntity;
}
