import { LayoutDashboard, BookOpen, Sparkles, Settings, LogOut, ChevronLeft, ChevronRight, Beaker, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ubyfolLogo from "@/assets/logo_ubyfol.png";
import { cn } from "@/lib/utils";
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
  SidebarHeader,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

const mainNavigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Análise de Patentes", url: "/patents", icon: Beaker },
  { title: "Estudos Científicos", url: "/research", icon: BookOpen },
];

const aiNavigationItems = [
  { title: "IA Avançada", url: "/ai-chat", icon: Sparkles },
];

interface AppSidebarProps {
  onOpenChat?: () => void;
}

export function AppSidebar({ onOpenChat }: AppSidebarProps) {
  const { open } = useSidebar();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || "");
        const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário";
        setUserName(name);
      }
    });
  }, []);

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

  const getUserInitials = () => {
    if (userName) {
      const names = userName.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return userName.substring(0, 2).toUpperCase();
    }
    return "UB";
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0 shadow-sm">
      <SidebarHeader className="h-16 border-b border-sidebar-border bg-sidebar-background">
        <div className="flex items-center justify-between h-full px-3">
          {open ? (
            <>
              <img 
                src={ubyfolLogo} 
                alt="Ubyfol" 
                className="h-9 w-auto"
              />
              <SidebarTrigger className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent">
                <ChevronLeft className="h-4 w-4 transition-transform" />
              </SidebarTrigger>
            </>
          ) : (
            <SidebarTrigger className="w-full flex items-center justify-center hover:bg-sidebar-accent rounded-md p-1">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center mx-auto">
                <span className="text-primary-foreground font-bold text-sm">UB</span>
              </div>
            </SidebarTrigger>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar-background">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 px-4 py-2 group-data-[collapsible=icon]:hidden">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2 group-data-[collapsible=icon]:px-1">
            <SidebarMenu>
              {mainNavigationItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
                        "hover:bg-sidebar-accent text-sidebar-foreground/80",
                        "border-l-2 border-transparent",
                        "group-data-[collapsible=icon]:border-l-0",
                        "group-data-[collapsible=icon]:w-10",
                        "group-data-[collapsible=icon]:h-10",
                        "group-data-[collapsible=icon]:p-0",
                        "group-data-[collapsible=icon]:mx-auto",
                        "group-data-[collapsible=icon]:justify-center"
                      )}
                      activeClassName={cn(
                        "bg-sidebar-accent text-sidebar-foreground font-medium border-l-2 border-primary",
                        "group-data-[collapsible=icon]:border-l-0",
                        "group-data-[collapsible=icon]:bg-primary/15",
                        "group-data-[collapsible=icon]:text-primary"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 px-4 py-2 group-data-[collapsible=icon]:hidden">
            Inteligência
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2 group-data-[collapsible=icon]:px-1">
            <SidebarMenu>
              {aiNavigationItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
                        "hover:bg-sidebar-accent text-sidebar-foreground/80",
                        "border-l-2 border-transparent",
                        "group-data-[collapsible=icon]:border-l-0",
                        "group-data-[collapsible=icon]:w-10",
                        "group-data-[collapsible=icon]:h-10",
                        "group-data-[collapsible=icon]:p-0",
                        "group-data-[collapsible=icon]:mx-auto",
                        "group-data-[collapsible=icon]:justify-center"
                      )}
                      activeClassName={cn(
                        "bg-sidebar-accent text-sidebar-foreground font-medium border-l-2 border-primary",
                        "group-data-[collapsible=icon]:border-l-0",
                        "group-data-[collapsible=icon]:bg-primary/15",
                        "group-data-[collapsible=icon]:text-primary"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="flex-1" />

        <SidebarGroup>
          <SidebarGroupContent className="px-2 group-data-[collapsible=icon]:px-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Configurações">
                  <NavLink
                    to="/settings"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
                      "hover:bg-sidebar-accent text-sidebar-foreground/80",
                      "border-l-2 border-transparent",
                      "group-data-[collapsible=icon]:border-l-0",
                      "group-data-[collapsible=icon]:w-10",
                      "group-data-[collapsible=icon]:h-10",
                      "group-data-[collapsible=icon]:p-0",
                      "group-data-[collapsible=icon]:mx-auto",
                      "group-data-[collapsible=icon]:justify-center"
                    )}
                    activeClassName={cn(
                      "bg-sidebar-accent text-sidebar-foreground font-medium border-l-2 border-primary",
                      "group-data-[collapsible=icon]:border-l-0",
                      "group-data-[collapsible=icon]:bg-primary/15",
                      "group-data-[collapsible=icon]:text-primary"
                    )}
                  >
                    <Settings className="h-5 w-5 shrink-0" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Configurações</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 bg-sidebar-background border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "h-auto p-2 hover:bg-sidebar-accent transition-all",
                open ? "w-full justify-start gap-3" : "w-10 h-10 p-0 mx-auto justify-center"
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              {open && (
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-sm font-medium text-sidebar-foreground truncate w-full">
                    {userName}
                  </span>
                  <span className="text-xs text-sidebar-foreground/60 truncate w-full">
                    {userEmail}
                  </span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
