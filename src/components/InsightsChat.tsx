import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Send, Bot, User, Loader2, X, Paperclip, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { sendToContextIA } from "@/lib/contextIA";
import { MODULE_OPTIONS, ModuleType, getPromptId } from "@/config/prompts";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface InsightsChatProps {
  className?: string;
}

export const InsightsChat = ({ className }: InsightsChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou seu assistente de inteligência competitiva avançado. Posso analisar arquivos e focar em diferentes módulos de inteligência. Como posso ajudar?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleType>("general");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    loadConversations();
  }, []);

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
        content: "Olá! Sou seu assistente de inteligência competitiva avançado. Posso analisar arquivos e focar em diferentes módulos de inteligência. Como posso ajudar?"
      }
    ]);
    setCurrentConversationId(null);
    setShowHistory(false);
    setAttachedFiles([]);
    setSelectedModule("general");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let conversationId = currentConversationId;

      if (!conversationId) {
        conversationId = await createNewConversation(textToSend);
      }

      await saveMessage(conversationId, "user", textToSend);

      // Se houver arquivos anexados, enviar para Context IA primeiro
      let contextIAResponse = "";
      if (attachedFiles.length > 0) {
        try {
          const promptId = getPromptId(selectedModule);
          const contextIA = await sendToContextIA(
            attachedFiles,
            textToSend,
            promptId || undefined
          );
          contextIAResponse = contextIA.response;
        } catch (error) {
          console.error("Error sending to Context IA:", error);
          toast({
            title: "Aviso",
            description: "Erro ao processar arquivos no Context IA. Continuando sem contexto dos arquivos.",
            variant: "default"
          });
        }
      }

      // Enviar para a edge function
      const { data, error } = await supabase.functions.invoke("dashboard-ai-chat", {
        body: {
          messages: [...messages, userMessage],
          advanced: true,
          module_id: selectedModule !== "general" ? getPromptId(selectedModule) : undefined,
          context_ia_response: contextIAResponse || undefined,
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
        content: data.response
      };

      setMessages((prev) => [...prev, assistantMessage]);
      await saveMessage(conversationId, "assistant", data.response);
      await loadConversations();
      
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
        {/* Arquivos anexados */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-2 pr-1"
              >
                <FileText className="h-3 w-3" />
                <span className="text-xs max-w-[150px] truncate">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Seletor de módulo */}
        <div className="flex items-center gap-2">
          <Select value={selectedModule} onValueChange={(value) => setSelectedModule(value as ModuleType)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione o módulo" />
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
        </div>

        {/* Input area */}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            title="Anexar arquivos"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Faça uma pergunta ou anexe arquivos para análise..."
            disabled={isLoading}
            className="flex-1 min-h-[60px] resize-none"
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
          Enter para enviar • Shift+Enter para nova linha • Anexe arquivos para análise avançada
        </p>
      </div>
    </div>
  );
};

