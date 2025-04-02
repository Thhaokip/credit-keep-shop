
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogOut, Menu } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "./Footer";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [shopName, setShopName] = useState(() => {
    const user = localStorage.getItem("creditkeep_user");
    if (user) {
      return JSON.parse(user).shopName || "Your Shop";
    }
    return "Your Shop";
  });
  
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("creditkeep_user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* UPI ID Banner */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center md:text-right">
        <div className="container max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-xs sm:text-sm font-medium hidden md:block">CreditKeep</div>
          <div className="text-xs sm:text-sm font-medium">
            <span className="mr-2">Donate:</span>
            <span className="font-semibold">UPI ID: thphillip@oksbi</span>
          </div>
        </div>
      </div>
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow">
        <div className="container max-w-7xl mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold">{shopName}</h2>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow container max-w-7xl mx-auto">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
