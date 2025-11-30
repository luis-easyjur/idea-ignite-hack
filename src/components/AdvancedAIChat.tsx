import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { prepareAdvancedPayload } from "@/lib/contextIA";
import { MODULE_OPTIONS, ModuleType, getPromptId } from "@/config/prompts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AdvancedAIChatProps {
  sessionId: string;
  className?: string;
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

export const AdvancedAIChat = ({ sessionId, className }: AdvancedAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou seu assistente de inteligência competitiva avançado. Posso ajudá-lo com análises profundas usando pesquisa avançada e deep research. Selecione um pilar de inteligência para focar sua pesquisa. Como posso ajudar?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<ModuleType>("general");
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
      // Obter o ID do prompt baseado no pilar selecionado
      const promptId = getPromptId(selectedPillar);

      if (!promptId) {
        throw new Error('Prompt ID não está configurado para o pilar selecionado');
      }

      // Preparar o payload avançado para envio à IA
      const payload = prepareAdvancedPayload(textToSend, promptId, sessionId);

      // Obter a URL da API da variável de ambiente
      const apiUrl = import.meta.env.VITE_CONTEXT_IA_API_URL || "https://ubyagro-api.onrender.com";
      const apiEndpoint = `${apiUrl.replace(/\/$/, "")}/chat`;

      // Enviar para o endpoint da API
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erro desconhecido" }));
        throw new Error(errorData.message || `Erro na API: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Extrair a resposta da IA - a API retorna "answer"
      const aiResponse = responseData.answer || responseData.response || responseData.text || responseData.message || responseData.content || "Desculpe, não foi possível obter uma resposta.";

      const assistantMessage: Message = {
        role: "assistant",
        content: aiResponse
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

  const showSuggestions = messages.length === 1;

  const selectedPillarLabel = MODULE_OPTIONS.find(m => m.value === selectedPillar)?.label || 'Pilar';

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-6" ref={scrollRef}>
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
      </div>

      <div className="px-6 py-4 border-t border-border space-y-3">
        {/* Seletor de pilar */}
        <div className="flex items-center gap-2">
          <Select value={selectedPillar} onValueChange={(value) => setSelectedPillar(value as ModuleType)}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecione o pilar">
                {selectedPillarLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {MODULE_OPTIONS.map((module) => (
                <SelectItem key={module.value} value={module.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{module.label}</span>
                    <span className="text-xs text-muted-foreground">{module.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="text-xs">
            Deep Research Ativo
          </Badge>
        </div>

        {/* Input area */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Faça uma pergunta com pesquisa avançada..."
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
        <p className="text-xs text-muted-foreground">
          Enter para enviar • Shift+Enter para nova linha • Pesquisa avançada com deep research ativado
        </p>
      </div>
    </div>
  );
};

