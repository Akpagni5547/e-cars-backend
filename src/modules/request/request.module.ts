import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientModule } from '../client/client.module';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';
import { RequestEntity } from '../../entities/request.entity';

import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { RequestListener } from './listeners/request.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequestEntity]),
    UserModule,
    MailModule,
    ClientModule,
    CacheModule.register({}),
  ],
  controllers: [RequestController],
  providers: [RequestService, RequestListener],
})
export class RequestModule {}
