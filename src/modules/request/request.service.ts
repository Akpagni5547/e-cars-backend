import { Injectable, NotFoundException } from '@nestjs/common';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleEnum } from 'src/enums/user-role.enum';
import { Repository } from 'typeorm';
import { AddRequestDto } from './dto/add-request.dto';
import { RequestEntity } from '../../entities/request.entity';
import { CarEntity } from 'src/entities/car.entity';
import { ClientEntity } from 'src/entities/client.entity';
import { UpdateRequestDto } from './dto/update-request.dto';
import { HttpService } from '@nestjs/axios';
import { TransactionEntity } from 'src/entities/transaction.entity';
@Injectable()
export class RequestService {
  constructor(
    @InjectRepository(RequestEntity)
    private requestRepository: Repository<RequestEntity>,
    @InjectRepository(CarEntity)
    private carRepository: Repository<CarEntity>,
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(ClientEntity)
    private clientRepository: Repository<ClientEntity>,
    private readonly httpService: HttpService,
  ) {}

  async findRequestById(id: string) {
    const request = await this.requestRepository.findOne({ where: { id: id } });
    if (!request) {
      throw new NotFoundException(`the request with id ${id} don't exist`);
    }
    return request;

    // if (user.role === UserRoleEnum.ADMIN) {
    //   return request;
    // } else throw new UnauthorizedException();
  }

  async updateRequest(
    id: string,
    request: UpdateRequestDto,
    notifyUrl: string,
  ): Promise<any> {
    const requestFounded = await this.requestRepository.findOne({
      where: { id: id },
    });

    if (!requestFounded) {
      throw new NotFoundException('Impossible de modifier cette requete');
    }

    // calcul du montant

    let amount = 0;
    // Prix avec ou sans chauffeur
    amount += requestFounded.isDelivery
      ? requestFounded.car.price_with_driver
      : requestFounded.car.price_no_driver;
    // Surplus en dehors de la ville
    amount += requestFounded.isGoOutCity ? 15000 : 0;
    // Surplus si livraison
    amount += requestFounded.isDelivery ? 10000 : 0;

    if (request.isAccept) {
      // init payment
      const baseUrl = process.env.PAYMENT_URL;

      const transaction = {
        amount: amount,
        api_key: process.env.PAYMENT_KEY,
        transaction_id: requestFounded.id,
        description: requestFounded.id,
        lang: 'fr',
        currency: 'XOF',
        channel: 'MOBILE_MONEY',
        country_code: 'CI',
        customer_firstname: requestFounded.client.name,
        customer_email: requestFounded.client.email,
        customer_phone_number: requestFounded.client.phone,
        notif_url: notifyUrl,
      };

      // faire le post vers paynat

      const requestConfig: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      };

      const { data } = await firstValueFrom(
        this.httpService.post(`${baseUrl}`, transaction, requestConfig).pipe(
          catchError((error: AxiosError) => {
            console.log(error.toJSON());
            throw "Une erreur s'est produite lors de l'initialisation du paiement";
          }),
        ),
      );

      // ensuite stocker les informations de paiements
      const newTransaction = this.transactionRepository.create({
        channel: transaction.channel,
        amount: transaction.amount,
        lang: transaction.lang,
        currency: transaction.currency,
        country_code: transaction.country_code,
        requestId: id,
        reference: data.data.reference,
        response: JSON.stringify(data.data),
      });
      await this.transactionRepository.save(newTransaction);
    }
    await this.requestRepository.update(id, {
      state: request.isAccept ? 'accepted' : 'declined',
    });
    return {
      message: 'La requete a été mise à jour',
    };
  }

  async getRequests(user): Promise<RequestEntity[]> {
    if (user.role === UserRoleEnum.ADMIN || user.role === UserRoleEnum.USER)
      return await this.requestRepository.find();
    return await this.requestRepository.find({ where: { deletedAt: null } });
  }

  async addRequest(request: AddRequestDto): Promise<any> {
    const car = await this.carRepository.findOne({
      where: { id: request.carId },
    });
    if (!car) {
      throw new NotFoundException(`Cette voiture n'existe pas`);
    }
    let client = await this.clientRepository.findOne({
      where: { email: request.clientEmail },
    });
    if (!client) {
      client = this.clientRepository.create({
        email: request.clientEmail,
        phone: request.clientPhone,
        name: request.clientName,
      });
      await this.clientRepository.save(client);
    }

    const newRequest = this.requestRepository.create({
      outOfDate: request.startDate,
      comeBackDate: request.endDate,
      state: 'pending',
      isDelivery: request.isDelivery,
      isGoOutCity: request.isGoOutCity,
      isDriver: request.isDriver,
      client: client,
      car: car,
    });
    await this.requestRepository.save(newRequest);
    return newRequest;
  }

  async softDeleteRequest(id: string, user) {
    const request = await this.requestRepository.findOne({ where: { id: id } });
    if (!request) {
      throw new NotFoundException('');
    }
    return this.requestRepository.softDelete(id);
  }
}
