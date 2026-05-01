import nodemailer from 'nodemailer';

export class SubscribeService {
  static async sendNewsletterEmail(email: string) {
    if (!email) {
      throw new Error('Email is required');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'prodgenie.metzap@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: 'Prodgenie Newsletter <prodgenie.metzap@gmail.com>',
      to: 'prodgenie.metzap@gmail.com',
      subject: 'New Newsletter Subscriber',
      text: `New subscriber: ${email}`,
    });

    return { success: true };
  }
}
