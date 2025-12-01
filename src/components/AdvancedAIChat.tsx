import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import {
    Send,
    Bot,
    User,
    Sparkles,
    Paperclip,
    X,
    FileText,
    Zap,
    Globe,
    Cpu,
    ChevronDown,
    FileText as FileIcon
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useToast } from "./ui/use-toast";

import { MODULE_OPTIONS, ModuleType, getPromptId } from "@/config/prompts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Textarea } from "./ui/textarea";

interface Source {
    source: string;
    snippet: string;
}

interface WebSource {
    title: string;
    uri: string;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    files?: File[];
    sources?: Source[];
    webSources?: WebSource[];
}

interface AdvancedAIChatProps {
    sessionId: string;
    className?: string;
    initialQuery?: string;
}

const quickSuggestions = [
    "Quais especialidades têm maior potencial de crescimento?",
    "Quais são as principais oportunidades em biofertilizantes?",
    "Qual o crescimento esperado para bioestimulantes até 2027?",
    "Quais tecnologias emergentes devo acompanhar?",
];

export const AdvancedAIChat = ({ sessionId, className, initialQuery }: AdvancedAIChatProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPillar, setSelectedPillar] = useState<ModuleType>("general");
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const [hasInitialized, setHasInitialized] = useState(false);

    // Expanded suggestions list for the pill layout
    const quickSuggestions = [
        "Quais especialidades têm maior potencial?",
        "Oportunidades em biofertilizantes",
        "Crescimento de bioestimulantes 2027",
        "Tecnologias emergentes no agro",
        "Performance da Stoller vs concorrentes",
        "Principais registros no MAPA",
        "Tendências de mercado para 2025",
        "Análise de competidores regionais"
    ];

    const scrollToBottom = () => {
        if (scrollRef.current) {
            const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    // Auto-send initial query
    useEffect(() => {
        if (initialQuery && initialQuery.trim() && !hasInitialized) {
            setHasInitialized(true);
            sendMessage(initialQuery);
        }
    }, [initialQuery, hasInitialized]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setAttachedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const sendMessage = async (text?: string) => {
        const textToSend = text || input.trim();
        if ((!textToSend && attachedFiles.length === 0) || isLoading) return;

        const userMessage: Message = {
            role: "user",
            content: textToSend,
            files: attachedFiles
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setAttachedFiles([]);
        setIsLoading(true);

        // Reset height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        try {
            const promptId = getPromptId(selectedPillar);
            if (!promptId) throw new Error('Prompt ID não configurado');

            const apiUrl = import.meta.env.VITE_CONTEXT_IA_API_URL || "https://ubyagro-api.onrender.com";

            // A API agora sempre espera multipart/form-data
            const { prepareAdvancedFormData } = await import("@/lib/contextIA");
            const formData = prepareAdvancedFormData(
                attachedFiles,
                textToSend,
                promptId,
                sessionId
            );

            const apiEndpoint = `${apiUrl.replace(/\/$/, "")}/chat/with-files`;

            const response = await fetch(apiEndpoint, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error(`Erro na API: ${response.status}`);

            const responseData = await response.json();
            console.log("AI Response Data:", responseData); // Debug log

            const aiResponse = responseData.answer || responseData.response || "Sem resposta.";
            const sources = responseData.internal_sources || responseData.sources || [];
            const webSources = responseData.web_sources || responseData.webSources || [];

            console.log("Extracted Sources:", { sources, webSources }); // Debug log

            setMessages(prev => [...prev, {
                role: "assistant",
                content: aiResponse,
                sources: sources,
                webSources: webSources
            }]);
        } catch (error) {
            console.error("Error:", error);
            toast({
                title: "Erro",
                description: "Falha ao enviar mensagem.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const selectedPillarLabel = MODULE_OPTIONS.find(m => m.value === selectedPillar)?.label || 'Pilar';

    const renderInput = () => (
        <div className="w-full max-w-3xl mx-auto relative group">
            <div className="relative bg-card border border-border rounded-3xl overflow-hidden shadow-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50">

                {/* Attached Files Preview */}
                {attachedFiles.length > 0 && (
                    <div className="flex gap-2 p-4 pb-0 overflow-x-auto scrollbar-hide">
                        {attachedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs animate-in zoom-in-50">
                                <FileIcon className="w-4 h-4 text-primary" />
                                <span className="max-w-[100px] truncate">{file.name}</span>
                                <button onClick={() => removeFile(idx)} className="hover:text-destructive transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Faça uma pergunta sobre o mercado..."
                    className="w-full bg-transparent border-none focus-visible:ring-0 resize-none min-h-[60px] max-h-[200px] p-4 text-base placeholder:text-muted-foreground/50"
                    rows={1}
                />

                <div className="flex items-center justify-between px-4 pb-3">
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 gap-2 rounded-full bg-muted/50 hover:bg-muted text-xs font-medium border border-border/50 text-muted-foreground hover:text-foreground">
                                    <Cpu className="w-3.5 h-3.5" />
                                    {selectedPillarLabel}
                                    <ChevronDown className="w-3 h-3 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[240px]">
                                {MODULE_OPTIONS.map((module) => (
                                    <DropdownMenuItem
                                        key={module.value}
                                        onClick={() => setSelectedPillar(module.value as ModuleType)}
                                        className="gap-2 py-2 cursor-pointer"
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-medium text-sm">{module.label}</span>
                                            <span className="text-[10px] text-muted-foreground">{module.description}</span>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                            <Zap className="w-3 h-3 text-primary" />
                            <span className="text-[10px] font-medium text-primary">Deep Research</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Paperclip className="w-4 h-4" />
                        </Button>
                        <Button
                            size="icon"
                            className={`h-9 w-9 rounded-full transition-all duration-300 ${input.trim() || attachedFiles.length > 0 ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground'}`}
                            onClick={() => sendMessage()}
                            disabled={!input.trim() && attachedFiles.length === 0}
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    const hasMessages = messages.length > 0;

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {!hasMessages ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
                    <div className="w-full max-w-3xl flex flex-col items-center gap-8">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 shadow-sm">
                                <Sparkles className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">IA Avançada</h1>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
                            {quickSuggestions.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => sendMessage(suggestion)}
                                    className="px-4 py-2 rounded-full bg-card hover:bg-muted border border-border text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-[1.02] shadow-sm text-left"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>

                        <div className="w-full mt-4">
                            {renderInput()}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <ScrollArea className="flex-1" ref={scrollRef}>
                        <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8">
                            {messages.map((message, idx) => (
                                <div key={idx} className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                    {message.role === "assistant" && (
                                        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 flex-shrink-0 mt-1">
                                            <Sparkles className="w-4 h-4 text-primary" />
                                        </div>
                                    )}

                                    <div className={`flex flex-col gap-2 max-w-[85%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                                        <div className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${message.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                                            : "bg-card border border-border rounded-tl-sm"
                                            }`}>
                                            {message.files && message.files.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-white/10">
                                                    {message.files.map((file, fIdx) => (
                                                        <div key={fIdx} className="flex items-center gap-2 bg-black/20 rounded px-2 py-1 text-xs">
                                                            <FileIcon className="w-3 h-3" />
                                                            <span>{file.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                                <ReactMarkdown>
                                                    {message.content.replace(/\[cite:.*?\]/g, '')}
                                                </ReactMarkdown>
                                            </div>

                                            {((message.sources && message.sources.length > 0) || (message.webSources && message.webSources.length > 0)) && (
                                                <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
                                                    {message.sources && message.sources.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                                                <FileIcon className="w-3 h-3" /> Fontes Internas
                                                            </p>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                                {message.sources.map((source, sIdx) => (
                                                                    <div key={sIdx} className="flex items-center gap-2 bg-muted/50 border border-border/50 rounded p-2 text-xs hover:bg-muted transition-colors" title={source.snippet}>
                                                                        <FileIcon className="w-3 h-3 text-primary flex-shrink-0" />
                                                                        <span className="truncate">{source.source}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {message.webSources && message.webSources.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                                                <Globe className="w-3 h-3" /> Fontes Web
                                                            </p>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                                {message.webSources.map((source, idx) => (
                                                                    <a
                                                                        key={idx}
                                                                        href={source.uri}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex flex-col gap-1 bg-muted/50 border border-border/50 rounded p-2 text-xs hover:bg-muted transition-colors group"
                                                                    >
                                                                        <span className="font-medium truncate text-foreground/90">{source.title}</span>
                                                                        <span className="truncate text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
                                                                            {source.uri}
                                                                        </span>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {message.role === "user" && (
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border flex-shrink-0 mt-1">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 flex-shrink-0 mt-1">
                                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-3 shadow-sm">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></div>
                                            </div>
                                            <span className="text-xs text-muted-foreground font-medium animate-pulse">
                                                Processando com Deep Research...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="h-4" /> {/* Spacer */}
                        </div>
                    </ScrollArea>

                    <div className="w-full px-4 py-6 bg-gradient-to-t from-background via-background to-transparent">
                        {renderInput()}
                        <p className="text-center text-[10px] text-muted-foreground mt-3">
                            A IA pode cometer erros. Considere verificar informações importantes.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

