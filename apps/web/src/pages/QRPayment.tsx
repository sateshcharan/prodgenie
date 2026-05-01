import { toast } from 'sonner';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useParams, useNavigate } from 'react-router-dom';

import { Input } from '@prodgenie/libs/ui/input';
import { Button } from '@prodgenie/libs/ui/button';
import { Card, CardContent } from '@prodgenie/libs/ui/card';
import { apiRoutes } from '@prodgenie/libs/constant/lib/apiRoutes';

import { useWorkspaceStore } from '@prodgenie/libs/store';

import api from '../utils/api';

const QRPayment = () => {
  const navigate = useNavigate();
  const { credits = '0', purpose = 'topup' } = useParams();
  const { activeWorkspace } = useWorkspaceStore();

  // console.log(activeWorkspace);

  const [txnId, setTxnId] = useState('');

  const upiId = import.meta.env.VITE_QR_ID;
  const name = import.meta.env.VITE_QR_NAME;

  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    name
  )}&am=${credits}&cu=INR`;

  const handleConfirm = async () => {
    if (!txnId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }

    try {
      // send txnId , credits, user
      const res = await api.post(
        `${apiRoutes.payment.base}${apiRoutes.payment.registerManualQRPayment}`,
        {
          amount: Number(credits),
          transactionId: txnId,
          workspaceId: activeWorkspace?.id,
          purpose,
        }
      );

      toast.success(
        'Payment submitted! Credits will be validated and updated shortly 🚀'
      );
      navigate('/dashboard');
    } catch (error) {
      toast.error(`Failed to confirm payment. Please contact admin ${error}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold capitalize">
          Pay ₹{credits} for {purpose}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Scan the QR code using any UPI app
        </p>
      </header>

      <Card>
        <CardContent className="flex flex-col items-center gap-6 p-6">
          <p className="text-sm text-muted-foreground">
            Scan the QR code to make payment and enter the transaction ID belowp
          </p>
          {/* QR Code */}
          <div className="bg-background p-4 rounded-lg">
            <QRCodeSVG value={upiLink} size={220} />
          </div>

          {/* UPI ID fallback */}
          <p className="text-sm text-muted-foreground">
            UPI ID: <span className="font-medium">{upiId}</span>
          </p>

          {/* Transaction ID input */}
          <div className="w-full space-y-2">
            <label className="text-sm font-medium">Enter Transaction ID</label>
            <Input
              placeholder="e.g. 1234567890"
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
            />
          </div>

          {/* Confirm Button */}
          <Button className="w-full" onClick={handleConfirm}>
            Confirm Payment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRPayment;
