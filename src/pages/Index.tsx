
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { IndianRupee, LucidePhone, Mail, Phone, User, UserRoundPlus } from "lucide-react";
import { Footer } from "@/components/Footer";
import { LoginForm } from "@/components/LoginForm";
import { RegisterForm } from "@/components/RegisterForm";
import { ScrollArea } from "@/components/ui/scroll-area";

const Index = () => {
  const [activeTab, setActiveTab] = useState("login");
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
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
      
      {/* Hero Section */}
      <section className="section-padding flex flex-col flex-grow">
        <div className="container max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                Manage Your Store Credits <span className="text-primary">Effortlessly</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Keep track of customer credits in one place. Simple, secure, and designed for your business.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2" onClick={() => setActiveTab("login")}>
                  <IndianRupee size={18} />
                  Start Managing Credits
                </Button>
                <Button size="lg" variant="outline" className="gap-2" onClick={() => setActiveTab("register")}>
                  <UserRoundPlus size={18} />
                  Register New Shop
                </Button>
              </div>
              
              <div className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      icon: <User className="h-8 w-8 text-primary" />,
                      title: "Customer Management",
                      description: "Keep track of all your customer data."
                    },
                    {
                      icon: <IndianRupee className="h-8 w-8 text-primary" />,
                      title: "Credit Tracking",
                      description: "Add and subtract credit amounts easily."
                    },
                    {
                      icon: <Phone className="h-8 w-8 text-primary" />,
                      title: "WhatsApp Integration",
                      description: "Send notifications directly to customers."
                    }
                  ].map((feature, index) => (
                    <Card key={index} className="bg-card/50">
                      <CardHeader className="pb-2">
                        <div className="mb-3">{feature.icon}</div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="lg:mx-auto w-full max-w-md">
              <AuthTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const AuthTabs = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register Shop</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login" className="space-y-4 animate-fade-in">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Shop Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your shop dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="register" className="space-y-4 animate-fade-in">
        <Card className="border-2 border-primary/20">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <UserRoundPlus className="h-5 w-5" />
              Register Your Shop
            </CardTitle>
            <CardDescription>
              Create an account to manage your customer credits
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden pt-4">
            <ScrollArea className="h-full max-h-[350px] pr-4">
              <RegisterForm />
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default Index;
