import nodemailer from 'nodemailer';
import env from '../../config/env.js';

class SmtpMailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.mail.smtp.host,
      port: env.mail.smtp.port,
      secure: env.mail.smtp.secure,
      auth: {
        user: env.mail.smtp.user,
        pass: env.mail.smtp.pass
      }
    });
  }


  async verifyConnection() {
    if (!env.mail.smtp.host) {
      throw new Error('SMTP_HOST is missing.');
    }

    if (!env.mail.smtp.user) {
      throw new Error('SMTP_USER is missing.');
    }

    if (!env.mail.smtp.pass) {
      throw new Error('SMTP_PASS is missing.');
    }

    if (!env.mail.fromAddress) {
      throw new Error('MAIL_FROM_ADDRESS is missing.');
    }

    await this.transporter.verify();
    return true;
  }


  async send({ to, subject, html, text }) {
    if (!to) {
      throw new Error('Email recipient is required.');
    }

    const result = await this.transporter.sendMail({
      from: `${env.mail.fromName} <${env.mail.fromAddress}>`,
      to,
      subject,
      html,
      ...(text ? { text } : {})
    });

    console.log('SMTP email sent:', { id: result.messageId, to });
    return result;
  }
}

export default new SmtpMailService();