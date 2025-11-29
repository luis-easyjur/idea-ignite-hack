import { Bell, Search, User, Bot } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import ubyagroLogo from "@/assets/ubyagro-logo.png";
import { useState } from "react";
import { AIChatSidebar } from "./AIChatSidebar";

export const Header = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <header className="border-b border-border bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <img 
                  src={ubyagroLogo} 
                  alt="UBYAGRO Grupo" 
                  className="h-10 w-auto"
                />
                <div className="border-l border-border pl-3">
                  <p className="text-sm font-semibold text-muted-foreground">Intelligence Platform</p>
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-xl hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por molécula, empresa ou tecnologia..."
                  className="pl-10 bg-background"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setChatOpen(true)}
                className="relative"
              >
                <Bot className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <AIChatSidebar isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
};
