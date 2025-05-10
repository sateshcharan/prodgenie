import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const UpiService = {
  async createOrder(amountInRupees: number, receipt: string) {
    const order = await razorpay.orders.create({
      amount: amountInRupees * 100, // in paise
      currency: 'INR',
      receipt,
      payment_capture: 1,
    });
    return order;
  },

  async verifySignature(
    payload: any,
    razorpaySignature: string,
    generatedSignature: string
  ) {
    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(payload)
      .digest('hex');
    return expectedSignature === razorpaySignature;
  },
};
