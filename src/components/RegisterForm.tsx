
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Mail, Loader2, Lock, Eye, EyeOff, Phone, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function RegisterForm() {
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shopName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            shop_name: shopName,
            phone: phone || null,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Registration successful! You can now login with your credentials.");
      
      // Check if email verification is required
      if (data?.user && data.session) {
        // If session exists, user is already logged in (email verification not required)
        toast.success("Registration complete! Redirecting to dashboard...");
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        // Clear the form
        setShopName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      console.error("Registration failed", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="shopName" className="text-sm">Shop Name</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="shopName"
            placeholder="Your Shop Name"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="pl-10 h-9 text-sm"
            required
          />
        </div>
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="email" className="text-sm">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            placeholder="yourshop@example.com"
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-9 text-sm"
            required
          />
        </div>
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="phone" className="text-sm">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            placeholder="Your Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="password" className="text-sm">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 h-9 text-sm"
            required
            minLength={6}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-6 w-6"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-3 w-3 text-muted-foreground" />
            ) : (
              <Eye className="h-3 w-3 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10 h-9 text-sm"
            required
            minLength={6}
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors font-semibold text-sm py-4 mt-1"
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? "Registering..." : "Submit Registration"}
        {!loading && <UserRoundPlus className="ml-2 h-4 w-4" />}
      </Button>
      
      <p className="text-xs text-center text-muted-foreground mt-1">
        By registering, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
}
