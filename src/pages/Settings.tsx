
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { WhatsAppSettings } from "@/components/WhatsAppSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("whatsapp");
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure your account and integrations
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg border p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="whatsapp">WhatsApp Integration</TabsTrigger>
              <TabsTrigger value="profile">Profile Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="whatsapp" className="animate-fade-in">
              <WhatsAppSettings />
            </TabsContent>
            
            <TabsContent value="profile" className="animate-fade-in">
              <div className="text-center py-8 text-muted-foreground">
                Profile settings will be available soon.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
