import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PaymentDialogProps {
  open: boolean;
  email: string;
  shopName: string;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

export function PaymentDialog({ 
  open, 
  email, 
  shopName, 
  onPaymentSuccess, 
  onCancel 
}: PaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const initiatePayment = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-payment-order', {
        body: { email, shopName },
      });

      console.log('Payment order response:', data);
      console.log('Payment order error:', error);

      if (error) throw error;

      if (!data?.paymentSessionId) {
        throw new Error('Payment session ID not received from server');
      }

      setOrderId(data.orderId);
      
      // Load Cashfree SDK and open payment
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.async = true;
      script.onload = () => {
        // @ts-ignore
        const cashfree = window.Cashfree({ mode: 'production' });
        
        cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          returnUrl: `${window.location.origin}/?payment=success&order_id=${data.orderId}`,
        });
      };
      document.body.appendChild(script);
      
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast.error(error.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => !loading && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Registration Fee
          </DialogTitle>
          <DialogDescription>
            Complete your registration with a one-time payment of ₹50
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shop Name:</span>
              <span className="font-medium">{shopName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{email}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between">
              <span className="font-semibold">Registration Fee:</span>
              <span className="font-bold text-primary">₹50</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={initiatePayment}
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Pay Now
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Powered by Cashfree Payments - Secure payment gateway
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
