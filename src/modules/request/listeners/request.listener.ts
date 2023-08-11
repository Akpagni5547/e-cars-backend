import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { EVENTS } from 'src/config/events';
import { MailService } from 'src/modules/mail/mail.service';

@Injectable()
export class RequestListener {
  constructor(private mailService: MailService) {}
  @OnEvent(EVENTS.REQUEST_ADD)
  async handleRequestAdded(payload: any) {
    console.log('functionality coming soon');
  }
}
