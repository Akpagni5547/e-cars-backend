import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { EVENTS } from 'src/config/events';
import { MailService } from 'src/modules/mail/mail.service';

@Injectable()
export class RequestListener {
  constructor(private mailService: MailService) {}

  @OnEvent(EVENTS.PAYMENT_FINISHED_SUCCESS)
  handlePaymentSuccess(payload: any) {
    this.mailService.addedRequestMail({
      to: 'Lebeaupaularthur@gmail.com',
      from: 'sandbox8641e0e9e3a24873a99665453cfccbaa.mailgun.org@mailgun.org',
      subject: 'Payment Success',
      text: 'client ',
      template: 'paymentsuccess',
      context: {
        data: payload,
      },
    });
  }

  @OnEvent(EVENTS.REFUSED_REQUEST)
  handleRequestRefused(payload: any) {
    this.mailService.addedRequestMail({
      to: 'Lebeaupaularthur@gmail.com',
      from: 'sandbox8641e0e9e3a24873a99665453cfccbaa.mailgun.org@mailgun.org',
      subject: 'Requete réfusé',
      text: 'client ',
      template: 'refusemail',
      context: {
        data: payload,
      },
    });
  }

  @OnEvent(EVENTS.APPROVE_REQUEST)
  handleRequestApprove(payload: any) {
    this.mailService.addedRequestMail({
      to: 'Lebeaupaularthur@gmail.com',
      from: 'sandbox8641e0e9e3a24873a99665453cfccbaa.mailgun.org@mailgun.org',
      subject: 'Requête approuvée',
      text: 'client ',
      template: 'acceptmail',
      context: {
        data: payload,
      },
    });
  }

  @OnEvent(EVENTS.REQUEST_ADD)
  handleRequestAdded(payload: any) {
    // Pour le client
    this.mailService.addedRequestMail({
      to: 'Lebeaupaularthur@gmail.com',
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
      to: 'Lebeaupaularthur@gmail.com',
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
