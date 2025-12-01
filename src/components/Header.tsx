import { Bell, Search, User, LogOut, Bot } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import { AlertsPanel } from "./AlertsPanel";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onOpenChat?: () => void;
}

export const Header = ({ onOpenChat }: HeaderProps) => {
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [userEmail, setUserEmail] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || "");
      }
    });
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Até logo!"
      });
      navigate("/auth");
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      const sessionId = crypto.randomUUID();
      const query = encodeURIComponent(searchQuery.trim());
      navigate(`/ai-chat?id=${sessionId}&q=${query}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between flex-1 gap-2">
        {/* Desktop Search */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <div className="w-full max-w-2xl relative">
            <div className="absolute -inset-[1px] rounded-full ai-search-border opacity-60 blur-[2px]" />
            <div className="relative bg-background rounded-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="✨ Pergunte algo para a IA Avançada..."
                className="pl-11 pr-4 h-11 bg-background border border-border/50 rounded-full focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Mobile Search Button */}
        <Button 
          variant="ghost" 
          size="icon"
          className="md:hidden"
          onClick={() => {
            const sessionId = crypto.randomUUID();
            navigate(`/ai-chat?id=${sessionId}`);
          }}
        >
          <Search className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-1 md:border-l md:pl-4 md:ml-4 border-border/50">
          {onOpenChat && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onOpenChat}
              title="Abrir chat com Gemini"
              className="hidden sm:flex"
            >
              <Bot className="h-5 w-5" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setAlertsOpen(true)}
          >
            <Bell className="h-5 w-5" />
            {unreadAlerts > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground">
                {unreadAlerts}
              </Badge>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm">Minha Conta</span>
                  <span className="text-xs text-muted-foreground font-normal truncate max-w-[200px]">{userEmail}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertsPanel 
        open={alertsOpen} 
        onOpenChange={setAlertsOpen}
        onUnreadCountChange={setUnreadAlerts}
      />
    </>
  );
};
