
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CreditDialog,
  CreditDialogMode 
} from "@/components/CreditDialog";
import { CustomerType } from "@/types/customer";
import { 
  IndianRupee, 
  Trash2, 
  Plus, 
  Minus, 
  MessageCircle 
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";

interface CustomerListProps {
  customers: CustomerType[];
  onUpdateAmount: (id: string, amount: number) => void;
  onDeleteCustomer: (id: string) => void;
}

export function CustomerList({ 
  customers, 
  onUpdateAmount,
  onDeleteCustomer 
}: CustomerListProps) {
  const [activeCreditDialog, setActiveCreditDialog] = useState<{
    customerId: string;
    mode: CreditDialogMode;
    open: boolean;
  }>({
    customerId: "",
    mode: "add",
    open: false,
  });
  
  const handleOpenCreditDialog = (
    customerId: string, 
    mode: CreditDialogMode
  ) => {
    setActiveCreditDialog({
      customerId,
      mode,
      open: true,
    });
  };
  
  const handleCreditUpdate = (amount: number) => {
    const { customerId, mode } = activeCreditDialog;
    const customer = customers.find(c => c.id === customerId);
    
    if (customer) {
      const newAmount = mode === "add" 
        ? customer.amount + amount 
        : customer.amount - amount;
        
      onUpdateAmount(customerId, newAmount);
      
      toast.success(`₹${amount} ${mode === "add" ? "added to" : "subtracted from"} ${customer.name}'s account`);
    }
    
    setActiveCreditDialog(prev => ({ ...prev, open: false }));
  };
  
  const handleWhatsAppShare = (customer: CustomerType) => {
    const message = `Dear ${customer.name}, your current credit amount at our store is ₹${customer.amount}. Thank you for your business!`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${customer.phone}?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, "_blank");
    toast.success(`Opening WhatsApp to send message to ${customer.name}`);
  };
  
  if (customers.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No customers found</h3>
        <p className="text-sm text-muted-foreground">
          {customers.length === 0 
            ? "Add your first customer to start managing credits" 
            : "No customers match your search"}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {customers.map((customer) => (
        <div key={customer.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-grow">
              <div className="flex flex-wrap items-start justify-between">
                <h3 className="text-lg font-medium">{customer.name}</h3>
                <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded">
                  <IndianRupee className="h-3.5 w-3.5" />
                  <span className="font-semibold">{customer.amount.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mt-1">
                {customer.phone}
              </div>
              
              {customer.address && (
                <div className="text-sm text-muted-foreground mt-1">
                  {customer.address}
                </div>
              )}
              
              {customer.notes && (
                <div className="text-sm mt-2 p-2 bg-muted/50 rounded">
                  {customer.notes}
                </div>
              )}
              
              <div className="text-xs text-muted-foreground mt-2">
                Last updated: {formatDistanceToNow(new Date(customer.lastUpdated), { addSuffix: true })}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1"
              onClick={() => handleOpenCreditDialog(customer.id, "add")}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1"
              onClick={() => handleOpenCreditDialog(customer.id, "subtract")}
            >
              <Minus className="h-3.5 w-3.5" />
              Subtract
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1"
              onClick={() => handleWhatsAppShare(customer)}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </Button>
            
            {customer.amount === 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive border-destructive/30 gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {customer.name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => onDeleteCustomer(customer.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      ))}
      
      <CreditDialog 
        open={activeCreditDialog.open}
        onOpenChange={(open) => setActiveCreditDialog(prev => ({ ...prev, open }))}
        mode={activeCreditDialog.mode}
        onSubmit={handleCreditUpdate}
      />
    </div>
  );
}
