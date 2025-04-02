
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IndianRupee, LogOut, Plus, Search, UserPlus } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CustomerList } from "@/components/CustomerList";
import { AddCustomerDialog } from "@/components/AddCustomerDialog";
import { CustomerType } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Load customer data
  useEffect(() => {
    async function fetchCustomers() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const mappedCustomers: CustomerType[] = data.map(customer => ({
            id: customer.id,
            name: customer.name,
            phone: customer.phone || '',
            address: customer.address || '',
            amount: Number(customer.credit_amount),
            notes: customer.notes || '',
            lastUpdated: customer.updated_at,
          }));
          
          setCustomers(mappedCustomers);
          setFilteredCustomers(mappedCustomers);
        }
      } catch (error: any) {
        console.error('Error fetching customers:', error);
        toast.error('Failed to load customers');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCustomers();
  }, [user]);
  
  // Filter customers based on search
  useEffect(() => {
    if (!search) {
      setFilteredCustomers(customers);
      return;
    }
    
    const searchLower = search.toLowerCase();
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchLower) ||
        (customer.phone && customer.phone.includes(search))
    );
    
    setFilteredCustomers(filtered);
  }, [search, customers]);
  
  // Add new customer
  const handleAddCustomer = async (customer: CustomerType) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          credit_amount: customer.amount,
          notes: customer.notes,
          shop_id: user!.id,
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      const newCustomer: CustomerType = {
        id: data.id,
        name: data.name,
        phone: data.phone || '',
        address: data.address || '',
        amount: Number(data.credit_amount),
        notes: data.notes || '',
        lastUpdated: data.updated_at,
      };
      
      setCustomers(prev => [...prev, newCustomer]);
      toast.success('Customer added successfully');
    } catch (error: any) {
      console.error('Error adding customer:', error);
      toast.error('Failed to add customer');
    }
  };
  
  // Update customer amount
  const handleUpdateAmount = async (id: string, newAmount: number) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          credit_amount: newAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      const updatedCustomers = customers.map(customer => 
        customer.id === id 
          ? { ...customer, amount: newAmount, lastUpdated: new Date().toISOString() } 
          : customer
      );
      
      setCustomers(updatedCustomers);
      toast.success('Credit amount updated');
    } catch (error: any) {
      console.error('Error updating amount:', error);
      toast.error('Failed to update credit amount');
    }
  };
  
  // Delete customer
  const handleDeleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      const updatedCustomers = customers.filter(customer => customer.id !== id);
      setCustomers(updatedCustomers);
      toast.success('Customer deleted');
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <DashboardLayout onSignOut={handleSignOut}>
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Customer Credits</h1>
            <p className="text-sm text-muted-foreground">
              Manage all your customer credits in one place
            </p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full md:w-[250px]"
              />
            </div>
            
            <Button onClick={() => setIsAddCustomerOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Customer</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg border">
          <ScrollArea className="h-[calc(100vh-230px)]">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">Loading customers...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground mb-4">No customers found</p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddCustomerOpen(true)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Your First Customer
                </Button>
              </div>
            ) : (
              <CustomerList 
                customers={filteredCustomers} 
                onUpdateAmount={handleUpdateAmount}
                onDeleteCustomer={handleDeleteCustomer}
              />
            )}
          </ScrollArea>
        </div>
      </div>
      
      <AddCustomerDialog
        open={isAddCustomerOpen}
        onOpenChange={setIsAddCustomerOpen}
        onAdd={handleAddCustomer}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
