import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { ClientEntity } from '../../entities/client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientEntity]),
    UserModule,

    CacheModule.register({}),
  ],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
