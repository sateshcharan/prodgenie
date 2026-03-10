import { randomUUID } from 'crypto';
import {
  StandardCheckoutClient,
  StandardCheckoutPayRequest,
  Env,
  MetaInfo,
  RefundRequest,
} from 'pg-sdk-node';

const clientId = process.env.PHONEPE_CLIENT_ID!;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET!;
const clientVersion = 1;
const env = Env.SANDBOX; // Env.PRODUCTION
const redirectUrl = process.env.PHONEPE_REDIRECT_URL!;
// const callbackUrl = process.env.PHONEPE_CALLBACK_URL!;

// Initialize PhonePe client
const client = StandardCheckoutClient.getInstance(
  clientId,
  clientSecret,
  clientVersion,
  env
);

export const PhonePeService = {
  async createPayment(
    merchantOrderId: string,
    amount: number,
    mobile: string,
    name: string
  ) {
    try {
      const metaInfo = MetaInfo.builder().udf1(mobile).udf2(name).build();

      const request = StandardCheckoutPayRequest.builder()
        .merchantOrderId(merchantOrderId)
        .amount(amount)
        // .redirectUrl(redirectUrl)
        .redirectUrl(`${redirectUrl}?orderId=${merchantOrderId}`)
        .metaInfo(metaInfo)
        .build();

      const response = await client.pay(request);

      // `${redirectUrl}?orderId=${orderId}`

      return {
        success: true,
        redirectUrl: response.redirectUrl,
        merchantOrderId,
        raw: response,
      };
    } catch (error: any) {
      console.error(
        'PhonePe createPayment error:',
        error.response?.data || error.message
      );
      throw error;
    }
  },

  async verifyPayment(merchantOrderId: string) {
    try {
      const response = await client.getOrderStatus(merchantOrderId);
      return response;
    } catch (error: any) {
      console.error(
        'PhonePe verifyPayment error:',
        error.response?.data || error.message
      );
      throw error;
    }
  },

  async refundPayment(originalOrderId: string, amount: number) {
    try {
      const refundId = randomUUID();
      const request = RefundRequest.builder()
        .amount(amount)
        .merchantRefundId(refundId)
        .originalMerchantOrderId(originalOrderId)
        .build();

      const response = await client.refund(request);
      console.log('PhonePe Refund Response:', response);

      return response;
    } catch (error: any) {
      console.error(
        'PhonePe refund error:',
        error.response?.data || error.message
      );
      throw error;
    }
  },
};
