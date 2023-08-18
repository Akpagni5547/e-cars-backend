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
import { AddCarDto } from './dto/add-car.dto';
import { CarEntity } from '../../entities/car.entity';
import { Cache } from 'cache-manager';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(CarEntity)
    private carRepository: Repository<CarEntity>,
    private userService: UserService,
    private eventEmitter: EventEmitter2, // @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findCarById(id: number, user) {
    const car = await this.carRepository.findOne({ where: { id: id } });
    if (!car) {
      throw new NotFoundException(`car with id ${id} don't exist`);
    }
    console.log('SERVICE CAR F' + user.role);

    if (this.userService.isOwnerOrAdmin(car, user)) {
      return car;
    } else throw new UnauthorizedException();
  }

  async getCars(): Promise<CarEntity[]> {
    return await this.carRepository.find({ where: { deletedAt: null } });
  }

  async addCar(car: AddCarDto, user): Promise<CarEntity> {
    console.log('CAR', car);
    console.log('SERVICE CAR F' + user.username);
    const newCar = this.carRepository.create(car);
    newCar.createBy = user;
    await this.carRepository.save(newCar);
    this.eventEmitter.emit(EVENTS.CAR_ADD, {
      name: user.username,
    });
    return newCar;
  }

  async updateCar(id: number, car: AddCarDto, user): Promise<CarEntity> {
    const newCar = await this.carRepository.preload({
      id,
      ...car,
    });

    if (!newCar) {
      throw new NotFoundException(`the car with id ${id} don't exist`);
    }
    if (this.userService.isOwnerOrAdmin(newCar, user))
      return await this.carRepository.save(newCar);
    else new UnauthorizedException('');
  }

  async deleteCar(id: number) {
    return await this.carRepository.delete(id);
  }

  async softDeleteCar(id: number, user) {
    const car = await this.carRepository.findOne({
      where: {
        id: id,
      },
    });
    console.log('car', car);
    if (!car) {
      throw new NotFoundException('');
    }
    if (this.userService.isOwnerOrAdmin(car, user))
      return this.carRepository.softDelete(id);
    else throw new UnauthorizedException('');
  }

  async restoreCar(id: number, user) {
    const car = await this.carRepository.query(
      'select * from car where id = ?',
      [id],
    );
    if (!car) {
      throw new NotFoundException('');
    }
    if (this.userService.isOwnerOrAdmin(car, user))
      return this.carRepository.restore(id);
    else throw new UnauthorizedException('');
  }
}
