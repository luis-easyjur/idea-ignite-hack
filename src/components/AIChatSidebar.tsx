import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Send, Bot, User, Loader2, X, Sparkles, Plus, MessageSquare, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { prepareBasicPayload } from "@/lib/contextIA";
import { PROMPT_IDS } from "@/config/prompts";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string>(() => crypto.randomUUID());
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }

    setConversations(data || []);
  };

  const loadConversation = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const { data: messagesData, error } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (messagesData && messagesData.length > 0) {
        setMessages(messagesData as Message[]);
        setCurrentConversationId(conversationId);
        setShowHistory(false);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a conversa",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async (firstMessage: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const title = firstMessage.substring(0, 50) + (firstMessage.length > 50 ? "..." : "");

      const { data: conversationData, error: convError } = await supabase
        .from("conversations")
        .insert({ user_id: userData.user.id, title })
        .select()
        .single();

      if (convError) throw convError;

      setCurrentConversationId(conversationData.id);
      return conversationData.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  };

  const saveMessage = async (conversationId: string, role: string, content: string) => {
    try {
      const { error } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, role, content });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

      if (error) throw error;

      toast({
        title: "Conversa excluída",
        description: "A conversa foi removida com sucesso"
      });

      loadConversations();
      
      if (currentConversationId === conversationId) {
        startNewChat();
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conversa",
        variant: "destructive"
      });
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Olá! Sou seu assistente de inteligência competitiva. Posso ajudá-lo a analisar os dados do dashboard, identificar tendências e fornecer insights estratégicos sobre o mercado de especialidades agrícolas. Como posso ajudar?"
      }
    ]);
    setCurrentConversationId(null);
    setShowHistory(false);
    // Resetar o hash da sessão ao iniciar um novo chat
    setChatSessionId(crypto.randomUUID());
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let conversationId = currentConversationId;

      if (!conversationId) {
        conversationId = await createNewConversation(textToSend);
      }

      await saveMessage(conversationId, "user", textToSend);

      // Obter o ID do prompt básico
      const basicPromptId = PROMPT_IDS.BASIC;

      if (!basicPromptId) {
        throw new Error('VITE_PROMPT_BASIC_ID não está configurado');
      }

      // Preparar o payload básico para envio à IA
      const payload = prepareBasicPayload(textToSend, basicPromptId, chatSessionId);

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
      await saveMessage(conversationId, "assistant", assistantMessage.content);
      await loadConversations();
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

  const showSuggestions = messages.length === 1 && !currentConversationId;

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-card border-l border-border z-50 flex flex-col shadow-xl">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Assistente IA</h3>
                <p className="text-xs text-muted-foreground">Inteligência Competitiva</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowHistory(!showHistory)}
                className="h-8 w-8"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={startNewChat}
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
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
        </div>

        {showHistory ? (
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground mb-3">Conversas Anteriores</h4>
              {conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma conversa salva</p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors group"
                  >
                    <button
                      onClick={() => loadConversation(conv.id)}
                      className="flex-1 text-left"
                    >
                      <p className="text-sm font-medium text-foreground line-clamp-1">{conv.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conv.updated_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        ) : (
          <>
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
                
                {showSuggestions && !isLoading && (
                  <div className="space-y-1 animate-in fade-in-50 duration-500">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Sparkles className="h-2.5 w-2.5" />
                      <span>Perguntas sugeridas:</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {quickSuggestions.map((suggestion, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors text-[11px] py-0.5 px-1.5 truncate"
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
          </>
        )}
      </div>
    </>
  );
};
