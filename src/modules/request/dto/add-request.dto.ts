import { CarEntity } from 'src/entities/car.entity';
import { ClientEntity } from 'src/entities/client.entity';

export class AddRequestDto {
  car: CarEntity;

  outOfDate: Date;

  comeBackDate: Date;

  state: string;

  client: ClientEntity;
}
