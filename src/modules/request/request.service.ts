import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
// import { EVENTS } from 'src/config/events';
import { UserRoleEnum } from 'src/enums/user-role.enum';
import { Repository } from 'typeorm';
// import { UserService } from '../user/user.service';
import { AddRequestDto } from './dto/add-request.dto';
import { RequestEntity } from '../../entities/request.entity';
// import { Cache } from 'cache-manager';
import { ClientService } from '../client/client.service';
import { CarEntity } from 'src/entities/car.entity';
import { ClientEntity } from 'src/entities/client.entity';
import { UpdateRequestDto } from './dto/update-request.dto';
import { EVENTS } from 'src/config/events';
@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(RequestEntity)
    private requestRepository: Repository<RequestEntity>,
    @InjectRepository(CarEntity)
    private carRepository: Repository<CarEntity>,
    @InjectRepository(ClientEntity)
    private clientRepository: Repository<ClientEntity>,
    private clientService: ClientService,
    private eventEmitter: EventEmitter2, // @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findRequestById(id: number) {
    const request = await this.requestRepository.findOne({ where: { id: id } });
    if (!request) {
      throw new NotFoundException(`the request with id ${id} don't exist`);
    }
    return request;

    // if (user.role === UserRoleEnum.ADMIN) {
    //   return request;
    // } else throw new UnauthorizedException();
  }

  async updateRequest(id: number, request: UpdateRequestDto): Promise<any> {
    const requestFounded = await this.requestRepository.findOne({
      where: { id: id },
    });

    if (!requestFounded) {
      throw new NotFoundException('Impossible de modifier cette requete');
    }
    await this.requestRepository.update(id, {
      state: request.isAccept ? 'accepted' : 'declined',
    });
    return {
      message: 'La requete a été prise en compte avec succès',
    };
  }

  async getRequests(user): Promise<RequestEntity[]> {
    console.log('WE ARE IN THE SERVICE');
    if (user.role === UserRoleEnum.ADMIN || user.role === UserRoleEnum.USER)
      return await this.requestRepository.find();
    return await this.requestRepository.find({ where: { deletedAt: null } });
  }

  async addRequest(request: AddRequestDto): Promise<any> {
    const car = await this.carRepository.findOne({
      where: { id: request.carId },
    });
    if (!car) {
      throw new NotFoundException(`Cette voiture n'existe pas`);
    }
    let client = await this.clientRepository.findOne({
      where: { email: request.clientEmail },
    });
    if (!client) {
      client = this.clientRepository.create({
        email: request.clientEmail,
        phone: request.clientPhone,
        name: request.clientName,
      });
      await this.clientRepository.save(client);
    }

    const newRequest = this.requestRepository.create({
      outOfDate: request.startDate,
      comeBackDate: request.endDate,
      state: 'pending',
      isDelivery: request.isDelivery,
      isGoOutCity: request.isGoOutCity,
      isDriver: request.isDriver,
      client: client,
      car: car,
    });
    await this.requestRepository.save(newRequest);

    this.eventEmitter.emit(EVENTS.REQUEST_ADD, {
      client: newRequest.client,
      car: newRequest.car,
      adminEmail: 'akpagniaugustin@gmail.com',
      driver: request.isDelivery ? 'Oui' : 'Non',
      out: request.isGoOutCity ? 'Oui' : 'Non',
      city: request.isDriver ? 'Oui' : 'Non',
    });

    return newRequest;
  }

  async softDeleteRequest(id: number, user) {
    const request = await this.requestRepository.findOne({ where: { id: id } });
    console.log('request delete');
    if (!request) {
      throw new NotFoundException('');
    }
    /* if (user.role === UserRoleEnum.ADMIN)
      return this.requestRepository.softDelete(id);
    else throw new UnauthorizedException(''); */
    return this.requestRepository.softDelete(id);
  }
}
