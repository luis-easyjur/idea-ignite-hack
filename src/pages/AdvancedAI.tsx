import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdvancedAIChat } from "@/components/AdvancedAIChat";

const AdvancedAI = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    // Verificar se existe hash/id na URL
    const idFromUrl = searchParams.get("id");
    
    if (idFromUrl) {
      // Se existe, usar o hash da URL
      setSessionId(idFromUrl);
    } else {
      // Se não existe, gerar novo hash e atualizar URL
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
      
      // Atualizar URL sem recarregar a página
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("id", newSessionId);
      navigate(`/ai-chat?${newSearchParams.toString()}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executar apenas uma vez ao montar

  // Não renderizar até ter o sessionId
  if (!sessionId) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground">Carregando...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="w-full h-screen flex flex-col">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">IA Avançada</h2>
                <p className="text-sm text-muted-foreground">
                  Pesquisa avançada com deep research • Sessão: {sessionId.substring(0, 8)}...
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-h-0">
            <AdvancedAIChat sessionId={sessionId} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AdvancedAI;

