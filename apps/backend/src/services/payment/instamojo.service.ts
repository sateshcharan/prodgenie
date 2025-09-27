// services/instamojo.service.ts
import axios from 'axios';

const INSTAMOJO_API_KEY = process.env.INSTAMOJO_API_KEY!;
const INSTAMOJO_AUTH_TOKEN = process.env.INSTAMOJO_AUTH_TOKEN!;
const INSTAMOJO_BASE_URL =
  process.env.INSTAMOJO_BASE_URL || 'https://test.instamojo.com/api/1.1';

export const InstamojoService = {
  async createPaymentRequest(amount: number, purpose: string, buyerEmail: string, redirectUrl: string) {
    const response = await axios.post(
      `${INSTAMOJO_BASE_URL}/payment-requests/`,
      {
        purpose,
        amount,
        buyer_email: buyerEmail,
        redirect_url: redirectUrl,
        send_email: true,
        allow_repeated_payments: false,
      },
      {
        headers: {
          'X-Api-Key': INSTAMOJO_API_KEY,
          'X-Auth-Token': INSTAMOJO_AUTH_TOKEN,
        },
      }
    );

    return response.data;
  },

  async getPaymentStatus(paymentRequestId: string) {
    const response = await axios.get(
      `${INSTAMOJO_BASE_URL}/payment-requests/${paymentRequestId}/`,
      {
        headers: {
          'X-Api-Key': INSTAMOJO_API_KEY,
          'X-Auth-Token': INSTAMOJO_AUTH_TOKEN,
        },
      }
    );

    return response.data;
  },
};
