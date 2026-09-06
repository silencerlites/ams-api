// src/services/mail.service.js

import { Resend } from 'resend';

import env from '../config/env.js';


class MailService {

  constructor() {
    this.client =
      new Resend(
        env.mail.apiKey
      );
  }


  async verifyConnection() {
    if (!env.mail.apiKey) {
      throw new Error(
        'RESEND_API_KEY is missing.'
      );
    }

    if (!env.mail.fromAddress) {
      throw new Error(
        'MAIL_FROM_ADDRESS is missing.'
      );
    }

    return true;
  }


  async send({
    to,
    subject,
    html,
    text
  }) {
    if (!to) {
      throw new Error(
        'Email recipient is required.'
      );
    }


    const {
      data,
      error
    } =
      await this.client
        .emails
        .send({
          from:
            `${env.mail.fromName} <${env.mail.fromAddress}>`,

          to: [
            to
          ],

          subject,

          html,

          ...(text
            ? {
                text
              }
            : {})
        });


    if (error) {
      console.error(
        'Resend email failed:',
        {
          to,
          statusCode:
            error.statusCode,
          name:
            error.name,
          message:
            error.message
        }
      );

      throw new Error(
        error.message ||
        'Email delivery failed.'
      );
    }


    console.log(
      'Email sent successfully:',
      {
        id:
          data?.id,
        to
      }
    );


    return data;
  }
}


export default new MailService();