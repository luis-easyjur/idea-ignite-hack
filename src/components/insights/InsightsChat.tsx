import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2, Paperclip, FileText, X, Layers } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Insight } from "./InsightCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { prepareInsightsPayload } from "@/lib/contextIA";
import { MODULE_OPTIONS, ModuleType, getPromptId } from "@/config/prompts";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface InsightsChatProps {
  onInsightGenerated?: (insight: Insight) => void;
}

const STORAGE_KEY = "insights-selected-module";

export const InsightsChat = ({ onInsightGenerated }: InsightsChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou seu assistente de insights estratégicos. Como posso ajudar?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Carregar módulo selecionado do localStorage
  const [selectedModule, setSelectedModule] = useState<ModuleType>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && MODULE_OPTIONS.some(m => m.value === saved)) {
        return saved as ModuleType;
      }
    }
    return "general";
  });
  
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Salvar módulo selecionado no localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, selectedModule);
    }
  }, [selectedModule]);

  const selectedModuleLabel = MODULE_OPTIONS.find(m => m.value === selectedModule)?.label || 'Módulo';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files]);
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Obter o ID do prompt do ContextoAI baseado no módulo selecionado
      const contextoAiPromptId = getPromptId(selectedModule);

      // Preparar o FormData para envio à IA
      const formData = prepareInsightsPayload(
        attachedFiles,
        textToSend,
        contextoAiPromptId,
        selectedModule
      );

      // Obter a URL da API da variável de ambiente
      const apiUrl = import.meta.env.VITE_CONTEXT_IA_API_URL || "https://ubyagro-api.onrender.com";
      // TODO: Definir o endpoint correto para insights (modo avançado)
      const apiEndpoint = `${apiUrl.replace(/\/$/, "")}/insights`; // Ajustar conforme necessário

      // Enviar para o endpoint da API
      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: formData, // FormData já define o Content-Type com boundary
      });

      // Por enquanto, apenas simular uma resposta já que é endpoint de teste
      // Em produção, isso será substituído pela chamada real à IA
      const assistantMessage: Message = {
        role: "assistant",
        content: "Payload enviado com sucesso! Verifique o console do navegador e a aba Network para ver os detalhes do payload."
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Limpar arquivos após envio
      setAttachedFiles([]);
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

  const isEmpty = messages.length === 1;

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="space-y-6 py-8">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center min-h-full px-4">
                <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-lg mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Bot className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-foreground">
                      Insights Estratégicos
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Análise avançada com IA integrando dados de todos os módulos
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1">
                      <Bot className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] ${
                      message.role === "user"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-foreground">
                      {message.content}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1">
                  <Bot className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Arquivos anexados - estilo Gemini */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 max-w-2xl mx-auto">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="group flex items-center gap-2 px-3 py-2 bg-muted/50 hover:bg-muted rounded-lg border border-border/50 transition-colors"
              >
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="max-w-2xl mx-auto">
          <div className="relative flex items-center gap-2 bg-background border border-border/50 rounded-full shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            
            {/* Seletor de módulo dentro do input */}
            <Select value={selectedModule} onValueChange={(value) => setSelectedModule(value as ModuleType)}>
              <SelectTrigger className="border-0 bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0 h-auto w-auto px-3 py-0 gap-1.5 shadow-none [&>span]:text-xs [&>span]:text-muted-foreground [&>span]:max-w-[120px] [&>span]:truncate">
                <Layers className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Módulo">
                  {selectedModuleLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {MODULE_OPTIONS.map((module) => (
                  <SelectItem 
                    key={module.value} 
                    value={module.value} 
                    className="hover:bg-primary hover:text-primary-foreground group data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground py-3"
                  >
                    <div className="flex flex-col w-full">
                      <span className="font-medium group-hover:text-primary-foreground">{module.label}</span>
                      <span className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 mt-0.5">
                        {module.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Separador visual */}
            <div className="h-6 w-px bg-border/50" />

            {/* Input de texto */}
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite uma mensagem..."
              disabled={isLoading}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-4 text-[15px]"
            />

            {/* Botões de ação */}
            <div className="flex items-center gap-1 pr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                title="Anexar arquivos"
                className="rounded-full h-8 w-8 shrink-0"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => sendMessage()} 
                disabled={isLoading || !input.trim()}
                size="icon"
                className="rounded-full h-8 w-8 shrink-0"
                variant={input.trim() ? "default" : "ghost"}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
