import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdvancedAIChat } from "@/components/AdvancedAIChat";

const AdvancedAI = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string>("");
  const [initialQuery, setInitialQuery] = useState<string>("");

  useEffect(() => {
    // Verificar se existe hash/id na URL
    const idFromUrl = searchParams.get("id");
    const queryFromUrl = searchParams.get("q");
    
    if (queryFromUrl) {
      setInitialQuery(decodeURIComponent(queryFromUrl));
      // Limpar o parâmetro q da URL após capturar
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("q");
      setSearchParams(newSearchParams, { replace: true });
    }
    
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
          <div className="flex-1 min-h-0">
            <AdvancedAIChat sessionId={sessionId} initialQuery={initialQuery} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AdvancedAI;

