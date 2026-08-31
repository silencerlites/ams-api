import nodemailer from 'nodemailer';
import env from '../config/env.js';

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
        host: env.smtp.host,
        port: env.smtp.port,
        secure: env.smtp.secure,

        auth: {
          user: env.smtp.user,
          pass: env.smtp.pass
        }
      });
  }

  async verifyConnection() { 
    return this.transporter.verify(); 
  }

  async send({ to, subject, html, text }) {
    return this.transporter.sendMail({
      from: {
        name: env.mail.fromName,
        address: env.mail.fromAddress
      },

      to,
      subject,
      html,
      text
    });
  }
}

export default new MailService();