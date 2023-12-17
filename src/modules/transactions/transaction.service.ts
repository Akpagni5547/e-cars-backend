import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestEntity } from 'src/entities/request.entity';
import { Repository } from 'typeorm';
import { TransactionEntity } from 'src/entities/transaction.entity';
import {
  RequestStatusPaymentEnum,
  TransactionStatusEnum,
} from 'src/enums/status.enum';

@Injectable()
export class TransactionService {
  constructor(
    private httpService: HttpService,
    @InjectRepository(RequestEntity)
    private requestRepository: Repository<RequestEntity>,
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
  ) {}
  async checkTransaction(reference: string) {
    // Faire une logique pour afficher la transaction en bd si possible
    const baseUrl = process.env.PAYMENT_URL;
    const { data } = await firstValueFrom(
      this.httpService.get(`${baseUrl}/${reference}/status`).pipe(
        catchError((error: AxiosError) => {
          throw 'An error happened!';
        }),
      ),
    );
    return { message: 'success' };
  }

  async callbackTransaction(request: any) {
    try {
      await this.transactionRepository.update(
        {
          requestId: request.data.description,
        },
        {
          status:
            request.data.status === 'Approved'
              ? TransactionStatusEnum.SUCCESS
              : TransactionStatusEnum.FAILED,
          response: JSON.stringify(request),
        },
      );

      await this.requestRepository.update(
        {
          id: request.data.description,
        },
        {
          statusPayment:
            request.data.status === 'Approved'
              ? RequestStatusPaymentEnum.SUCCESS
              : RequestStatusPaymentEnum.FAILED,
        },
      );
    } catch (error) {
      console.log('error lors du callback');
      console.log(error);
    }

    return { message: 'success' };
  }
}
