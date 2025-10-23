import {
  StandardCheckoutClient,
  Env,
  MetaInfo,
  StandardCheckoutPayRequest,
  RefundRequest,
} from 'pg-sdk-node';
import { randomUUID } from 'crypto';

const clientId = process.env.PHONEPE_CLIENT_ID!;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET!;
const clientVersion = 1;
const env = process.env.PHONEPE_ENV === 'PROD' ? Env.PRODUCTION : Env.SANDBOX;
// const redirectUrl =
// process.env.PHONEPE_REDIRECT_URL || 'https://yourapp.com/payment/success';
// const callbackUrl =
//   process.env.PHONEPE_CALLBACK_URL ||
//   'https://yourapp.com/api/payment/phonepe/callback';
const redirectUrl = process.env.PHONEPE_REDIRECT_URL;
const callbackUrl = process.env.PHONEPE_CALLBACK_URL;

// Initialize PhonePe client
const client = StandardCheckoutClient.getInstance(
  clientId,
  clientSecret,
  clientVersion,
  env
);

export const PhonePeService = {
  /* Create a payment order with PhonePe   */
  async createPayment(
    orderId: string,
    amount: number,
    mobile: string,
    name: string
  ) {
    try {
      const metaInfo = MetaInfo.builder().udf1(mobile).udf2(name).build();

      const request = StandardCheckoutPayRequest.builder()
        .merchantOrderId(orderId)
        .amount(amount * 100)
        .redirectUrl(redirectUrl)
        .metaInfo(metaInfo)
        .build();

      const response = await client.pay(request);
      // console.log('PhonePe Payment Response:', response);

      return {
        success: true,
        redirectUrl: response.redirectUrl,
        orderId,
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

  /* Verify payment status */
  async verifyPayment(orderId: string) {
    try {
      const response = await client.getOrderStatus(orderId);
      console.log('PhonePe Payment Status:', response);
      return response;
    } catch (error: any) {
      console.error(
        'PhonePe verifyPayment error:',
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /* Initiate refund */
  async refundPayment(originalOrderId: string, amount: number) {
    try {
      const refundId = randomUUID();
      const request = RefundRequest.builder()
        .amount(amount * 100)
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
