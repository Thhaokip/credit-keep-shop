
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

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerType[]>([]);
  const navigate = useNavigate();
  
  // Authentication check
  useEffect(() => {
    const user = localStorage.getItem("creditkeep_user");
    if (!user) {
      navigate("/");
    }
  }, [navigate]);
  
  // Load mock customer data
  useEffect(() => {
    // In a real app, this would fetch from Google Sheets API
    const mockCustomers: CustomerType[] = [
      {
        id: "1",
        name: "John Doe",
        phone: "9876543210",
        address: "123 Main St, City",
        amount: 5000,
        notes: "Monthly grocery credit",
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Jane Smith",
        phone: "8765432109",
        address: "",
        amount: 2500,
        notes: "Weekly supplies",
        lastUpdated: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "3",
        name: "Raj Kumar",
        phone: "7654321098",
        address: "456 Park Avenue, Town",
        amount: 7500,
        notes: "",
        lastUpdated: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
    
    setCustomers(mockCustomers);
    setFilteredCustomers(mockCustomers);
  }, []);
  
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
        customer.phone.includes(search)
    );
    
    setFilteredCustomers(filtered);
  }, [search, customers]);
  
  // Add new customer
  const handleAddCustomer = (customer: CustomerType) => {
    const newCustomers = [...customers, customer];
    setCustomers(newCustomers);
  };
  
  // Update customer amount
  const handleUpdateAmount = (id: string, newAmount: number) => {
    const updatedCustomers = customers.map(customer => 
      customer.id === id 
        ? { ...customer, amount: newAmount, lastUpdated: new Date().toISOString() } 
        : customer
    );
    
    setCustomers(updatedCustomers);
  };
  
  // Delete customer
  const handleDeleteCustomer = (id: string) => {
    const updatedCustomers = customers.filter(customer => customer.id !== id);
    setCustomers(updatedCustomers);
  };

  return (
    <DashboardLayout>
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
            <CustomerList 
              customers={filteredCustomers} 
              onUpdateAmount={handleUpdateAmount}
              onDeleteCustomer={handleDeleteCustomer}
            />
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
