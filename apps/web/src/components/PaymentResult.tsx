import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

import { Button } from '@prodgenie/libs/ui/button';
import { apiRoutes } from '@prodgenie/libs/constant';

import api from '../utils/api';

export default function PaymentResult() {
  const [search] = useSearchParams();
  const orderId = search.get('orderId');

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>(
    'loading'
  );

  useEffect(() => {
    if (!orderId) return;

    console.log(orderId);

    async function verify() {
      try {
        const { data } = await api.get(
          `${apiRoutes.payment.base}/phonepe/status/${orderId}`
        );

        if (data.status === 'completed') {
          setStatus('success');
        } else {
          setStatus('failed');
        }
      } catch (err) {
        setStatus('failed');
      }
    }

    verify();
  }, [orderId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-600">Verifying your payment…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-background shadow-lg rounded-2xl p-8 text-center">
        {status === 'success' ? (
          <>
            <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
            <h1 className="text-2xl font-semibold mt-4">Payment Successful!</h1>
            <p className="text-gray-600 mt-2">
              Your payment for Order <strong>{orderId}</strong> has been
              completed successfully.
            </p>

            <Button
              className="mt-6 w-full"
              onClick={() => (window.location.href = '/dashboard')}
            >
              Go to Dashboard
            </Button>
          </>
        ) : (
          <>
            <XCircle className="mx-auto h-16 w-16 text-red-600" />
            <h1 className="text-2xl font-semibold mt-4">Payment Failed</h1>
            <p className="text-gray-600 mt-2">
              We couldn't complete your payment for Order{' '}
              <strong>{orderId}</strong>.
            </p>
            <p className="text-gray-600">You may try again.</p>

            <Button
              variant="destructive"
              className="mt-6 w-full"
              onClick={() => (window.location.href = '/dashboard')}
            >
              Retry Payment
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
