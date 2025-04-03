
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Phone, Save } from "lucide-react";

interface WhatsAppFormData {
  whatsappEnabled: boolean;
  whatsappPhone: string;
}

export function WhatsAppSettings() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState<WhatsAppFormData>({
    whatsappEnabled: false,
    whatsappPhone: "",
  });

  // Load user's WhatsApp settings
  const loadWhatsAppSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('whatsapp_enabled, whatsapp_phone')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setFormData({
          whatsappEnabled: data.whatsapp_enabled || false,
          whatsappPhone: data.whatsapp_phone || "",
        });
      }
    } catch (error) {
      console.error('Error loading WhatsApp settings:', error);
      toast.error('Failed to load WhatsApp settings');
    } finally {
      setLoading(false);
    }
  };

  // Load settings when component mounts
  useState(() => {
    loadWhatsAppSettings();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to update settings');
      return;
    }

    // Validate phone number format
    if (formData.whatsappEnabled && !formData.whatsappPhone.match(/^\d{10,15}$/)) {
      toast.error('Please enter a valid phone number (10-15 digits)');
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          whatsapp_enabled: formData.whatsappEnabled,
          whatsapp_phone: formData.whatsappPhone,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success('WhatsApp settings updated successfully');
    } catch (error) {
      console.error('Error updating WhatsApp settings:', error);
      toast.error('Failed to update WhatsApp settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone size={20} />
          WhatsApp Integration
        </CardTitle>
        <CardDescription>
          Configure your WhatsApp to send messages to customers
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="whatsapp-enabled"
              checked={formData.whatsappEnabled}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, whatsappEnabled: checked }))
              }
            />
            <Label htmlFor="whatsapp-enabled">Enable WhatsApp integration</Label>
          </div>

          {formData.whatsappEnabled && (
            <div className="space-y-2">
              <Label htmlFor="whatsapp-phone">WhatsApp Phone Number</Label>
              <div className="flex items-center">
                <span className="bg-muted px-3 py-2 rounded-l-md border border-r-0 border-input text-muted-foreground">+</span>
                <Input
                  id="whatsapp-phone"
                  placeholder="919876543210 (without spaces or dashes)"
                  value={formData.whatsappPhone}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, whatsappPhone: e.target.value }))
                  }
                  className="rounded-l-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your full phone number with country code (e.g., 919876543210 for India)
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="gap-2">
            <Save size={16} />
            Save WhatsApp Settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
