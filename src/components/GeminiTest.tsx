import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const GeminiTest = () => {
  const [message, setMessage] = useState("Olá, você está funcionando?");
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "ai-chat-quick-test",
        {
          body: { message },
        }
      );

      if (invokeError) {
        console.error("Erro ao invocar função:", invokeError);
        let errorMessage = invokeError.message || "Erro ao chamar a função";
        
        // Mensagens mais específicas baseadas no tipo de erro
        if (invokeError.message?.includes("Function not found") || invokeError.message?.includes("404")) {
          errorMessage = "Função não encontrada. Certifique-se de que a Edge Function 'ai-chat-quick-test' foi deployada no Supabase.";
        } else if (invokeError.message?.includes("401") || invokeError.message?.includes("403")) {
          errorMessage = "Erro de autenticação. Verifique suas credenciais do Supabase.";
        } else if (invokeError.message?.includes("500")) {
          errorMessage = "Erro interno na Edge Function. Verifique os logs no Supabase Dashboard.";
        }
        
        setError(errorMessage);
        return;
      }

      if (data?.error) {
        setError(data.error);
        if (data.details) {
          console.error("Detalhes do erro:", data.details);
        }
        return;
      }

      if (data?.success && data?.response) {
        setResponse(data.response);
      } else {
        setError("Resposta inesperada da API");
        console.log("Resposta completa:", data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      console.error("Erro completo:", err);
      setError(`${errorMessage}. Verifique o console para mais detalhes.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Teste de Conexão com Gemini</CardTitle>
        <CardDescription>
          Teste se a conexão com o Google Gemini está funcionando corretamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Mensagem de Teste</label>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite uma mensagem para testar..."
            disabled={isLoading}
          />
        </div>

        <Button onClick={testConnection} disabled={isLoading || !message.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testando...
            </>
          ) : (
            "Testar Conexão"
          )}
        </Button>

        {response && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-green-800 dark:text-green-200">
                  Conexão funcionando!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {response}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-800 dark:text-red-200">
                  Erro na conexão
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-2 p-3 bg-muted rounded-lg">
          <p className="font-semibold">Troubleshooting:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Certifique-se de que a Edge Function <code className="bg-background px-1 rounded">ai-chat-quick-test</code> foi deployada no Supabase</li>
            <li>Verifique se a <code className="bg-background px-1 rounded">GEMINI_API_KEY</code> está configurada em Project Settings → Edge Functions → Secrets</li>
            <li>Verifique os logs da Edge Function no Supabase Dashboard (Edge Functions → ai-chat-quick-test → Logs)</li>
            <li>Esta função testa apenas a conexão com Gemini, sem RAG</li>
          </ul>
          <p className="mt-2 font-semibold">Como fazer deploy:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Use o Supabase CLI: <code className="bg-background px-1 rounded">supabase functions deploy ai-chat-quick-test</code></li>
            <li>Ou use o Supabase Dashboard: Edge Functions → Deploy new function</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

