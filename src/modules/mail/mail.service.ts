import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}
  addedRequestMail(payload) {
    this.mailerService
      .sendMail(payload)
      .then(() => {
        console.log('successfully');
      })
      .catch((error) => {
        console.log(error);
        console.log('failed');
      });
  }
}
