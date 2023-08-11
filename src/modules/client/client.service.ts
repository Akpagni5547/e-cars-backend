import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientEntity } from '../../entities/client.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRoleEnum } from 'src/enums/user-role.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientSubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(ClientEntity)
    private clientRepository: Repository<ClientEntity>,
    private eventEmitter: EventEmitter2,
  ) {}

  async getClients(user): Promise<ClientEntity[]> {
    console.log('WE ARE IN THE SERVICE');
    if (user.role === UserRoleEnum.ADMIN || user.role === UserRoleEnum.USER)
      console.log('WE ARE IN THE SERVICE 2');
    return await this.clientRepository.find();
  }

  async addClient(
    clientData: ClientSubscribeDto,
  ): Promise<Partial<ClientEntity>> {
    const newClient = this.clientRepository.create({ ...clientData });

    try {
      await this.clientRepository.save(newClient);
    } catch (e) {
      throw new ConflictException(`error saved client`);
    }
    return {
      id: newClient.id,
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
    };
  }

  async findClientById(id: number) {
    const client = await this.clientRepository.findOne({ where: { id: id } });
    if (!client) {
      throw new NotFoundException(`client with id ${id} don't exist`);
    }
    return client;
  }
}
