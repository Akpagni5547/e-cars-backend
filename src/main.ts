import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { DurationInterceptor } from './interceptors/duration.interceptor';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  app.enableCors();
  await app.listen(configService.get('APP_PORT'));
  app.use((req: Request, res: Response, next) => {
    console.log('Middelware from app.use');
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalInterceptors(new DurationInterceptor());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(new Reflector()));
}
bootstrap();
