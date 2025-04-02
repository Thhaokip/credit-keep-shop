
import { Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-muted py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">CreditKeep</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Simple and secure credit management for your shop
          </p>
          
          <Separator className="my-4" />
          
          <div className="flex justify-center items-center gap-2 mb-4">
            <Mail size={16} className="text-muted-foreground" />
            <a 
              href="mailto:thphillip@gmail.com" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              thphillip@gmail.com
            </a>
          </div>
          
          <p className="text-sm text-muted-foreground">
            SimbengInfo, {new Date().getFullYear()} - All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
