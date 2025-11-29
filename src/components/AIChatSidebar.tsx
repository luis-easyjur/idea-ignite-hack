import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Send, Bot, User, Loader2, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickSuggestions = [
  "Quais especialidades têm maior potencial de crescimento?",
  "Como a Stoller está performando comparada aos concorrentes?",
  "Quais são as principais oportunidades em biofertilizantes?",
  "Qual o crescimento esperado para bioestimulantes até 2027?",
  "Quais tecnologias emergentes devo acompanhar?",
  "Qual concorrente está mais ativo no mercado?",
  "Quais regiões apresentam maior crescimento?",
  "Quais são os principais registros recentes no MAPA?",
];

export const AIChatSidebar = ({ isOpen, onClose }: AIChatSidebarProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou seu assistente de inteligência competitiva. Posso ajudá-lo a analisar os dados do dashboard, identificar tendências e fornecer insights estratégicos sobre o mercado de especialidades agrícolas. Como posso ajudar?"
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
      const { data, error } = await supabase.functions.invoke("dashboard-ai-chat", {
        body: { messages: [...messages, userMessage] }
      });

      if (error) {
        throw error;
      }

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
        content: data.response
      };

      setMessages(prev => [...prev, assistantMessage]);
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

  const showSuggestions = messages.length === 1; // Only show when there's just the welcome message

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-card border-l border-border z-50 flex flex-col shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Assistente IA</h3>
                <p className="text-xs text-muted-foreground">Powered by Gemini</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
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
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
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
            
            {/* Quick Suggestions */}
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

        {/* Input */}
        <div className="px-6 py-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Faça uma pergunta..."
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
    </>
  );
};
