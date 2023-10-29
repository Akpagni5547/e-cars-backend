import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientModule } from '../client/client.module';
import { HttpModule } from '@nestjs/axios';
import { RequestEntity } from '../../entities/request.entity';

import { TransactionEntity } from '../../entities/transaction.entity';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { MailModule } from '../mail/mail.module';
import { RequestListener } from '../request/listeners/request.listener';

@Module({
  imports: [
    HttpModule.register({
      timeout: 7000,
    }),
    TypeOrmModule.forFeature([RequestEntity, TransactionEntity]),
    ClientModule,
    MailModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService, RequestListener],
})
export class TransactionModule {}
