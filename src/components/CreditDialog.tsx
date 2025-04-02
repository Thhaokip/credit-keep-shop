
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IndianRupee, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type CreditDialogMode = "add" | "subtract";

interface CreditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: CreditDialogMode;
  onSubmit: (amount: number) => void;
}

export function CreditDialog({ 
  open, 
  onOpenChange, 
  mode, 
  onSubmit 
}: CreditDialogProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  
  const resetForm = () => {
    setAmount("");
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount);
    
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    try {
      setLoading(true);
      // In a real implementation, this would connect to Google Sheets API
      // For now, we'll just simulate a success for demonstration
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSubmit(parsedAmount);
      resetForm();
    } catch (error) {
      console.error(`Failed to ${mode} credit`, error);
      toast.error(`Failed to ${mode} credit. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const title = mode === "add" ? "Add Credit" : "Subtract Credit";
  const description = mode === "add" 
    ? "Add credit amount to this customer's account." 
    : "Subtract credit amount from this customer's account.";
  const buttonText = mode === "add" ? "Add Credit" : "Subtract Credit";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        resetForm();
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="credit-amount">Amount (₹)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="credit-amount"
                placeholder="0.00"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className={mode === "subtract" ? "bg-amber-600 hover:bg-amber-700" : undefined}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Processing..." : buttonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
