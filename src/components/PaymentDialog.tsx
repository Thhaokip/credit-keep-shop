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

      if (error) {
        let message = error.message || 'Failed to create payment order';
        const context = (error as any).context;

        if (context && typeof context.json === 'function') {
          try {
            const payload = await context.json();
            message = payload?.error || payload?.message || message;
          } catch {
            // Keep the original Supabase error message if the response body is not JSON.
          }
        }

        throw new Error(message);
      }

      if (!data?.paymentSessionId) {
        throw new Error('Payment session ID not received from server');
      }

      setOrderId(data.orderId);
      
      // Load Cashfree SDK (ensure single instance) and open payment
      const loadCashfree = () =>
        new Promise<void>((resolve, reject) => {
          if (document.getElementById('cashfree-sdk')) return resolve();
          const s = document.createElement('script');
          s.id = 'cashfree-sdk';
          s.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
          s.async = true;
          s.onload = () => resolve();
          s.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
          document.body.appendChild(s);
        });

      await loadCashfree();

      // @ts-ignore
      const cashfree = await (window as any).Cashfree({ mode: 'production' });
      try {
        // @ts-ignore
        const v = cashfree?.version?.();
        console.log('Cashfree SDK loaded (production). Version:', v);
      } catch {}

      await cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        // Do not override returnUrl; use the one set during order creation to respect Cashfree origin/domain checks
      });
      
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
