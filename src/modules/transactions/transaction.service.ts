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
import { EVENTS } from 'src/config/events';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TransactionService {
  constructor(
    private httpService: HttpService,
    private eventEmitter: EventEmitter2,
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
    console.log(data);
    return { message: 'success' };
  }

  async callbackTransaction(request: any) {
    try {
      // rechercher la transaction en question dans la bd et mettre a jour

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

      // mettre a jour la table request
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

      const newRequest = await this.requestRepository.findOne({
        where: { id: request.data.description },
      });
      // informer le client que son paiement a ete effectué

      const message = `
        Bonjour ${
          newRequest.client.name
        }, votre paiement a été traité avec succès. Votre demande de voiture est confirmée.

        Infos demande :
        ID : ${newRequest.id}
        Modèle : ${newRequest.car.model}
        Marque : ${newRequest.car.brand}

        Options :
        - Chauffeur : ${newRequest.isDelivery == true ? 'Oui' : 'Non'}
        - Livraison :${newRequest.isGoOutCity == true ? 'Oui' : 'Non'}
        - Sortie de ville : ${newRequest.isDriver == true ? 'Oui' : 'Non'}

        Un message de confirmation détaillé vous sera envoyé prochainement.
        Contactez-nous sur ce numéro ${process.env.NUMBER_ADMIN}.

        Merci pour votre confiance !
        `;
      await this.sendSms(message, newRequest.client.phone);

      // this.eventEmitter.emit(EVENTS.PAYMENT_FINISHED_SUCCESS, {
      //   client: newRequest.client,
      //   car: newRequest.car,
      //   id: newRequest.id,
      //   adminEmail: 'akpagniaugustin@gmail.com',
      //   paymentLink: 'lien de payemnt',
      //   driver: newRequest.isDelivery ? 'Oui' : 'Non',
      //   out: newRequest.isGoOutCity ? 'Oui' : 'Non',
      //   city: newRequest.isDriver ? 'Oui' : 'Non',
      // });
    } catch (error) {
      console.log('error lors du callback');
      console.log(error);
    }

    return { message: 'success' };
  }

  private async sendSms(
    message: string,
    numbers: string | string[],
  ): Promise<void> {
    const apiUrl = process.env.SMS_URL;
    const username = process.env.SMS_USERNAME;
    const password = process.env.SMS_PASSWORD;
    const sender = process.env.SMS_SENDER;

    const numberArray = Array.isArray(numbers) ? numbers : [numbers];
    const formattedNumbers = numberArray.map(this.formatPhoneNumber);
    const toNumbers = formattedNumbers.join(';');
    const encodedMessage = encodeURIComponent(message);
    const url = `${apiUrl}?username=${username}&password=${password}&sender=${sender}&to=${toNumbers}&text=${encodedMessage}&type=text`;
    try {
      const response = await firstValueFrom(
        this.httpService.get(url).pipe(
          catchError(() => {
            throw 'An error happened when sending sms';
          }),
        ),
      );
      console.log('SMS sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending SMS:', error.message);
      throw error;
    }
  }
  private formatPhoneNumber(number: string): string {
    const numericNumber = number.replace(/\D/g, '');
    const formattedNumber = numericNumber.startsWith('225')
      ? numericNumber
      : `225${numericNumber}`;
    return formattedNumber;
  }
}
