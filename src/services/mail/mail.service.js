import env from '../../config/env.js';
import resendMailService from './resend-mail.service.js';
import smtpMailService from './smtp-mail.service.js';

class MailService {
  constructor() { 
    this.provider = this.resolveProvider();
  }

  resolveProvider() {
    switch (env.mail.driver ?.toLowerCase()) {
      case 'resend': return resendMailService;
      case 'smtp': return smtpMailService;
      default: throw new Error(`Unsupported MAIL_DRIVER: ${env.mail.driver}`);
    }
  }

  async verifyConnection() {
    return this.provider.verifyConnection();
  }

  async send(payload) {
    return this.provider.send(payload);
  }
}

export default new MailService();