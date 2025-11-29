import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Insight } from "./InsightCard";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface InsightsChatProps {
  onInsightGenerated?: (insight: Insight) => void;
}

const quickSuggestions = [
  "Analise as principais tendências do mercado",
  "Quais são as oportunidades em bioestimulantes?",
  "Identifique riscos regulatórios recentes",
  "Compare o desempenho dos principais concorrentes",
  "Quais tecnologias emergentes devo acompanhar?",
  "Analise o crescimento por região",
];

export const InsightsChat = ({ onInsightGenerated }: InsightsChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou seu assistente de insights estratégicos. Posso analisar dados de todos os módulos (Regulatory, Patents, Market, Competitors, Research) e gerar insights profundos com raciocínio avançado. Como posso ajudar?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Usar Edge Function insights-ai que coleta contexto completo
      const { data, error } = await supabase.functions.invoke("insights-ai", {
        body: { 
          query: textToSend,
          messages: [...messages, userMessage],
          conversation_history: messages
        }
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Erro",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "Desculpe, não foi possível gerar uma análise."
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Tentar extrair insights estruturados da resposta (se a API retornar)
      if (data.metadata?.insights && Array.isArray(data.metadata.insights)) {
        data.metadata.insights.forEach((insight: any) => {
          // Garantir que o insight tenha a estrutura correta
          const formattedInsight: Insight = {
            id: insight.id || `insight-${Date.now()}-${Math.random()}`,
            title: insight.title || "Insight Gerado",
            description: insight.description || insight.content || "",
            type: insight.type || "recommendation",
            confidence: insight.confidence,
            impact: insight.impact,
            category: insight.category,
            sources: insight.sources,
            createdAt: insight.createdAt || new Date().toISOString(),
            metadata: insight.metadata
          };
          onInsightGenerated?.(formattedInsight);
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showSuggestions = messages.length === 1;

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Análise com IA</h3>
            <p className="text-xs text-muted-foreground">Insights estratégicos com raciocínio avançado</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-6" ref={scrollRef}>
        <div className="space-y-4 py-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-secondary" />
                </div>
              )}
            </div>
          ))}
          
          {showSuggestions && !isLoading && (
            <div className="space-y-3 animate-in fade-in-50 duration-500">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span>Perguntas sugeridas:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors text-xs py-1.5 px-3"
                    onClick={() => sendMessage(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="px-6 py-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Faça uma pergunta ou solicite uma análise..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Enter para enviar • Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
};

