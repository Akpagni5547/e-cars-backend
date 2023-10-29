import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientModule } from '../client/client.module';
import { MailModule } from '../mail/mail.module';
import { HttpModule } from "@nestjs/axios";
import { UserModule } from '../user/user.module';
import { RequestEntity } from '../../entities/request.entity';

import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { RequestListener } from './listeners/request.listener';
import { CarEntity } from 'src/entities/car.entity';
import { ClientEntity } from 'src/entities/client.entity';
import { TransactionEntity } from 'src/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequestEntity, CarEntity, ClientEntity, TransactionEntity]),
    UserModule,
    HttpModule,
    MailModule,
    ClientModule,
    CacheModule.register({}),
  ],
  controllers: [RequestController],
  providers: [RequestService, RequestListener],
})
export class RequestModule {}
