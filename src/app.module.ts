import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
// import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import { CarModule } from './modules/car/car.module';
import { ClientModule } from './modules/client/client.module';
import { ImageModule } from './modules/images/image.module';
import { RequestModule } from './modules/request/request.module';
import { UserModule } from './modules/user/user.module';
import { TransactionModule } from './modules/transactions/transaction.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
      debug: false,
    }),
    UserModule,
    CarModule,
    RequestModule,
    TransactionModule,
    ClientModule,
    ImageModule,
    EventEmitterModule.forRoot(),
  ],
})
export class AppModule {}
