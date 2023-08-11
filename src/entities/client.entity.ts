import { TimestampMetadata } from 'src/generics/timestamp.metadata';
import { RequestEntity } from 'src/entities/request.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('client')
export class ClientEntity extends TimestampMetadata {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @OneToMany((type) => RequestEntity, (request) => request.client, {
    nullable: true,
    cascade: true,
  })
  requests: RequestEntity[];
}
