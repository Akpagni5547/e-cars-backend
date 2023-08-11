import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}
  async addedRequestMail(payload) {
    await this.mailerService.sendMail({});
  }
}
