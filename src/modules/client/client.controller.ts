import {
  Body,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { ClientService } from './client.service';
import { ClientSubscribeDto } from './dto/subscribe.dto';
import { ClientEntity } from '../../entities/client.entity';

@Controller('client')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CacheInterceptor)
  @CacheKey('client.get.all')
  @CacheTTL(60 * 60 * 24)
  async getAllClients(@User() user): Promise<ClientEntity[]> {
    return await this.clientService.getClients(user);
  }

  @Post()
  addClient(@Body() userData: ClientSubscribeDto) {
    return this.clientService.addClient(userData);
  }
}
