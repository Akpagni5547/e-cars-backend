import { CacheModule, Module } from '@nestjs/common';
import { CarService } from './car.service';
import { CarController } from './car.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarEntity } from '../../entities/car.entity';
import { UserModule } from '../user/user.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([CarEntity]),
    UserModule,
    CacheModule.register({}),
    MulterModule.register({ dest: './uploads' }),
  ],
  controllers: [CarController],
  providers: [CarService],
})
export class CarModule {}
