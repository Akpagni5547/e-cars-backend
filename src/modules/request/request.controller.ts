import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { AddRequestDto } from './dto/add-request.dto';
import { RequestEntity } from '../../entities/request.entity';
import { RequestService } from './request.service';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Request } from 'express';

@Controller('request')
export class RequestController {
  constructor(private requestService: RequestService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  // @UseInterceptors(CacheInterceptor)
  // @CacheKey('request.get.all')
  // @CacheTTL(60 * 60 * 24)
  async getAllRequest(@User() user): Promise<RequestEntity[]> {
    return await this.requestService.getRequests(user);
  }
  @Post()
  async addRequest(
    @Body() addRequestDto: AddRequestDto,
  ): Promise<RequestEntity> {
    return await this.requestService.addRequest(addRequestDto);
  }

  @Get(':id')
  async getRequest(@Param('id') id): Promise<RequestEntity> {
    return await this.requestService.findRequestById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateRequest(
    @Req() req: Request,
    @Body() updateRequestDto: UpdateRequestDto,
    @Param('id') id: string,
  ): Promise<RequestEntity> {
    const protocol = req.protocol;
    const host = req.get('Host');
    const notifyUrl = `${protocol}//${host}/transaction/callback`;
    return await this.requestService.updateRequest(
      id,
      updateRequestDto,
      notifyUrl,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteRequest(@Param('id') id: string, @User() user) {
    return this.requestService.softDeleteRequest(id, user);
  }
}
