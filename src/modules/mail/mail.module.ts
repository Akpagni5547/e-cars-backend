import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        port: 587,
        host: process.env.SERVICE,
        auth: {
          user: 'postmaster@sandbox8641e0e9e3a24873a99665453cfccbaa.mailgun.org',
          pass: process.env.PASS,
        },
      },
      defaults: {
        from: '"No Reply" <aymen.noreply@gmail.com>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
