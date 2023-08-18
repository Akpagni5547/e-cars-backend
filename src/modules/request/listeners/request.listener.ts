import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { EVENTS } from 'src/config/events';
import { MailService } from 'src/modules/mail/mail.service';

@Injectable()
export class RequestListener {
  constructor(private mailService: MailService) {}
  @OnEvent(EVENTS.REQUEST_ADD)
  handleRequestAdded(payload: any) {
    // Pour le client
    this.mailService.addedRequestMail({
      to: 'akpagniaugustin@gmail.com',
      from: 'sandbox8641e0e9e3a24873a99665453cfccbaa.mailgun.org@mailgun.org',
      subject: 'Requete pris en compte',
      text: 'client ',
      template: 'clientemail',
      context: {
        data: payload,
      },
    });

    // Pour l'admin
    this.mailService.addedRequestMail({
      to: 'akpagniaugustin@gmail.com',
      from: 'sandbox8641e0e9e3a24873a99665453cfccbaa.mailgun.org@mailgun.org',
      subject: 'Nouvelle requete demandé',
      text: 'client ',
      template: 'adminemail',
      context: {
        data: payload,
      },
    });
  }
}
