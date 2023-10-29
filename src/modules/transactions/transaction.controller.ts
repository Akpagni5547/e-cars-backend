import { Controller, Get, UseGuards, Param, Post, Req, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { TransactionService } from './transaction.service';
import { Request } from 'express';

export interface RequestCallback {
  code: number;
  message: string;
  data: DataCallback;
}

interface DataCallback {
  amount: number;
  description: string;
  currency: string;
  status: string;
  payment_method: string;
}

@Controller('transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get('reference/:id')
  @UseGuards(JwtAuthGuard)
  async checkTransaction(@Param('id') id): Promise<any> {
    return await this.transactionService.checkTransaction(id);
  }

  @Post('callback')
  async callback(@Req() request: Request): Promise<any> {
    return await this.transactionService.callbackTransaction(request.body);
  }
}
