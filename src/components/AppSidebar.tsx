import { LayoutDashboard, FileText, Beaker, TrendingUp, Building2, BookOpen, Bot, Settings, LogOut, ChevronLeft, Brain, Sparkles } from "lucide-react";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";


const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Inteligência Regulatória", url: "/regulatory", icon: FileText },
  { title: "Análise de Patentes", url: "/patents", icon: Beaker },
  { title: "Mercado & Tendências", url: "/market", icon: TrendingUp },
  { title: "Monitor de Concorrentes", url: "/competitors", icon: Building2 },
  { title: "Estudos Científicos", url: "/research", icon: BookOpen },
  { title: "Insights Estratégicos", url: "/insights", icon: Brain },
  { title: "IA Avançada", url: "/ai-chat", icon: Sparkles },
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
    <Sidebar collapsible="icon" className="border-r-0 shadow-sm">
      <SidebarContent className="bg-sidebar-background">
        <SidebarGroup>
          <SidebarGroupLabel className="h-16 flex items-center gap-2 px-4 bg-sidebar-background">
            {open && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">UB</span>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-sidebar-foreground">UBYAGRO</h2>
                  <p className="text-xs text-sidebar-foreground/60">Intelligence</p>
                </div>
              </div>
            )}
            {!open && (
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
                <span className="text-primary-foreground font-bold text-sm">UB</span>
              </div>
            )}
          </SidebarGroupLabel>

          <SidebarGroupContent className="px-2 mt-2">
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 hover:bg-sidebar-accent transition-colors rounded-md text-sidebar-foreground/80"
                      activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
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

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent className="px-2">
            <SidebarMenu>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Configurações">
                  <NavLink
                    to="/settings"
                    className="flex items-center gap-3 hover:bg-sidebar-accent transition-colors rounded-md text-sidebar-foreground/80"
                    activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
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

      <SidebarFooter className="p-2 bg-sidebar-background border-t border-sidebar-border">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            className="flex-1 justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {open && <span>Sair</span>}
          </Button>

          <SidebarTrigger className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent">
            <ChevronLeft className={`h-4 w-4 transition-transform ${!open ? 'rotate-180' : ''}`} />
          </SidebarTrigger>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
