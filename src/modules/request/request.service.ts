import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { EVENTS } from 'src/config/events';
import { UserRoleEnum } from 'src/enums/user-role.enum';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { AddRequestDto } from './dto/add-request.dto';
import { RequestEntity } from '../../entities/request.entity';
import { Cache } from 'cache-manager';
import { ClientService } from '../client/client.service';
@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(RequestEntity)
    private requestRepository: Repository<RequestEntity>,
    private clientService: ClientService,
    private eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findRequestById(id: number, user) {
    const request = await this.requestRepository.findOne({ where: { id: id } });
    if (!request) {
      throw new NotFoundException(`the request with id ${id} don't exist`);
    }

    if (user.role === UserRoleEnum.ADMIN) {
      return request;
    } else throw new UnauthorizedException();
  }

  async updateRequest(
    id: number,
    request: Partial<AddRequestDto>,
    user,
  ): Promise<RequestEntity> {
    const newRequest = await this.requestRepository.preload({
      id,
      ...request,
    });

    if (!newRequest) {
      throw new NotFoundException(`the request with id ${id} don't exist`);
    }

    /* if (user.role) return await this.requestRepository.save(newRequest);
    else new UnauthorizedException(''); */
    return await this.requestRepository.save(newRequest);
  }

  async getRequests(user): Promise<RequestEntity[]> {
    console.log('WE ARE IN THE SERVICE');
    if (user.role === UserRoleEnum.ADMIN || user.role === UserRoleEnum.USER)
      return await this.requestRepository.find();
    return await this.requestRepository.find({ where: { deletedAt: null } });
  }

  async addRequest(request: AddRequestDto): Promise<RequestEntity> {
    const newRequest = this.requestRepository.create(request);
    console.log(request);
    /*  newRequest.client = client; */
    await this.requestRepository.save(newRequest);

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
