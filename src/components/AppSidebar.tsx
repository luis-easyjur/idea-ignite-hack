import { LayoutDashboard, FileText, Beaker, TrendingUp, Building2, Bot, Settings, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Inteligência Regulatória", url: "/regulatory", icon: FileText },
  { title: "Análise de Patentes", url: "/patents", icon: Beaker },
  { title: "Mercado & Tendências", url: "/market", icon: TrendingUp },
  { title: "Monitor de Concorrentes", url: "/competitors", icon: Building2 },
];

interface AppSidebarProps {
  onOpenChat?: () => void;
}

export function AppSidebar({ onOpenChat }: AppSidebarProps) {
  const { open } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao fazer logout");
      console.error("Logout error:", error);
    } else {
      toast.success("Logout realizado com sucesso");
      navigate("/auth");
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="h-16 flex items-center gap-2 px-4">
            {open && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">UB</span>
                </div>
                <div>
                  <h2 className="text-sm font-semibold">UBYAGRO</h2>
                  <p className="text-xs text-muted-foreground">Intelligence</p>
                </div>
              </div>
            )}
            {!open && (
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
                <span className="text-primary-foreground font-bold text-sm">UB</span>
              </div>
            )}
          </SidebarGroupLabel>
          
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 hover:bg-accent/50 transition-colors"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        <SidebarGroup>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onOpenChat} tooltip="Assistente IA">
                  <Bot className="h-4 w-4" />
                  <span>Assistente IA</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Configurações">
                  <NavLink
                    to="/settings"
                    className="flex items-center gap-3 hover:bg-accent/50 transition-colors"
                    activeClassName="bg-accent text-accent-foreground font-medium"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {open && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
