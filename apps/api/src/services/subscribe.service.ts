import nodemailer from 'nodemailer';

export class SubscribeService {
  async sendNewsletterEmail(email: string) {
    if (!email) {
      throw new Error('Email is required');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'care.metzap@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: 'Prodgenie Newsletter <care.metzap@gmail.com>',
      to: 'care.metzap@gmail.com',
      subject: 'New Newsletter Subscriber',
      text: `New subscriber: ${email}`,
    });

    return { success: true };
  }
}
