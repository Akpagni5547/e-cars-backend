import {
  CACHE_MANAGER,
  HttpServer,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
// import { EVENTS } from 'src/config/events';
import { UserRoleEnum } from 'src/enums/user-role.enum';
import { Repository } from 'typeorm';
// import { UserService } from '../user/user.service';
import { AddRequestDto } from './dto/add-request.dto';
import { RequestEntity } from '../../entities/request.entity';
// import { Cache } from 'cache-manager';
import { ClientService } from '../client/client.service';
import { CarEntity } from 'src/entities/car.entity';
import { ClientEntity } from 'src/entities/client.entity';
import { UpdateRequestDto } from './dto/update-request.dto';
import { EVENTS } from 'src/config/events';
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
    private eventEmitter: EventEmitter2, // @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

      // send email
      // this.eventEmitter.emit(EVENTS.APPROVE_REQUEST, {
      //   client: requestFounded.client,
      //   car: requestFounded.car,
      //   id: requestFounded.id,
      //   adminEmail: 'akpagniaugustin@gmail.com',
      //   paymentLink: data.data.url,
      //   driver: requestFounded.isDelivery ? 'Oui' : 'Non',
      //   out: requestFounded.isGoOutCity ? 'Oui' : 'Non',
      //   city: requestFounded.isDriver ? 'Oui' : 'Non',
      // });
      const message = `
        Bonjour ${requestFounded.client.name}, nous sommes heureux de vous informer que votre demande a été acceptée.
        Informations de la demande :
        ID : ${requestFounded.id}
        Modèle : ${requestFounded.car.model}
        Marque : ${requestFounded.car.brand}

        Procédez au paiement en cliquant sur le lien suivant : ${data.data.url}.

        Après le paiement, vous recevrez une confirmation de réservation détaillée.
        Pour des questions, contactez-nous au ${process.env.NUMBER_ADMIN}.
        Merci de nous avoir choisis !`;
      await this.sendSms(message, requestFounded.client.phone);
    } else {
      // send email
      // this.eventEmitter.emit(EVENTS.REFUSED_REQUEST, {
      //   client: requestFounded.client,
      //   car: requestFounded.car,
      //   id: requestFounded.id,
      //   adminEmail: 'akpagniaugustin@gmail.com',
      //   driver: requestFounded.isDelivery ? 'Oui' : 'Non',
      //   out: requestFounded.isGoOutCity ? 'Oui' : 'Non',
      //   city: requestFounded.isDriver ? 'Oui' : 'Non',
      // });
      const message = `
      Bonjour ${requestFounded.client.name}, votre demande a été refusée.
      ID : ${requestFounded.id},
      Modèle : ${requestFounded.car.model},
      Marque : ${requestFounded.car.brand}.
      Désolés. Pour plus d'infos, contactez-nous sur ce numero ${process.env.NUMBER_ADMIN}. Merci.`;
      await this.sendSms(message, requestFounded.client.phone);
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
    // Client
    const messageClient = `
    Bonjour ${request.clientName}, nous avons pris en compte votre demande.
    Infos demande :
    Modèle : ${car.model}
    Marque : ${car.brand}
    Options :
    - Chauffeur : ${request.isDelivery == true ? 'Oui' : 'Non'}
    - Livraison : ${request.isGoOutCity == true ? 'Oui' : 'Non'}
    - Sortie de ville : ${request.isDriver == true ? 'Oui' : 'Non'}
    Pour des questions, contactez-nous au ${process.env.NUMBER_ADMIN}.
    Merci de nous choisir !`;
    // Admin
    const messageAdmin = `
    Cher administrateur,
    Un client a soumis une nouvelle demande de voiture :

    Informations du client :
    Nom : ${client.name}
    Email : ${client.email}
    Téléphone : ${client.phone}

    Options de la demande :
    - Option chauffeur : ${request.isDelivery == true ? 'Oui' : 'Non'}
    - Option sortie en ville : ${request.isGoOutCity == true ? 'Oui' : 'Non'}
    - Option livraison : ${request.isDriver == true ? 'Oui' : 'Non'}

    Informations de la voiture :
    Modèle : ${car.model}
    Marque : ${car.brand}

    Veuillez prendre en charge cette demande et résoudre les détails avec le client.
    Merci !`;
    await this.sendSms(messageClient, client.phone);
    await this.sendSms(messageAdmin, process.env.NUMBER_ADMIN);
    // this.eventEmitter.emit(EVENTS.REQUEST_ADD, {
    //   client: newRequest.client,
    //   car: newRequest.car,
    //   id: newRequest.id,
    //   adminEmail: 'akpagniaugustin@gmail.com',
    //   driver: request.isDelivery ? 'Oui' : 'Non',
    //   out: request.isGoOutCity ? 'Oui' : 'Non',
    //   city: request.isDriver ? 'Oui' : 'Non',
    // });

    return newRequest;
  }

  async softDeleteRequest(id: string, user) {
    const request = await this.requestRepository.findOne({ where: { id: id } });
    if (!request) {
      throw new NotFoundException('');
    }
    /* if (user.role === UserRoleEnum.ADMIN)
      return this.requestRepository.softDelete(id);
    else throw new UnauthorizedException(''); */
    return this.requestRepository.softDelete(id);
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
