import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Regulatory from "./pages/Regulatory";
import Patents from "./pages/Patents";
import Market from "./pages/Market";
import Competitors from "./pages/Competitors";
import Research from "./pages/Research";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Index />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/regulatory"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Regulatory />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/patents"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Patents />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/market"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Market />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/competitors"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Competitors />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/research"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Research />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
