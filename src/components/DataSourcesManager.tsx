import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type Pillar = "mercado" | "regulatorio" | "patente" | "cientifico";

interface MonitoredTerm {
  id: string;
  name: string;
  url: string;
  token: string;
  requestBody: string;
}

const pillars: { key: Pillar; label: string }[] = [
  { key: "mercado", label: "Mercado" },
  { key: "regulatorio", label: "Dados Regulatório" },
  { key: "patente", label: "Patente" },
  { key: "cientifico", label: "Científico" },
];

export function DataSourcesManager() {
  const [currentPillar, setCurrentPillar] = useState<Pillar>("mercado");
  const [terms, setTerms] = useState<Record<Pillar, MonitoredTerm[]>>({
    mercado: [],
    regulatorio: [],
    patente: [],
    cientifico: [],
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    url: "", 
    token: "", 
    requestBody: "" 
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [termToDelete, setTermToDelete] = useState<string | null>(null);

  const currentIndex = pillars.findIndex((p) => p.key === currentPillar);
  const currentPillarData = pillars[currentIndex];

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % pillars.length;
    setCurrentPillar(pillars[nextIndex].key);
    setIsAdding(false);
    setEditingId(null);
  };

  const handlePrevious = () => {
    const prevIndex = (currentIndex - 1 + pillars.length) % pillars.length;
    setCurrentPillar(pillars[prevIndex].key);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ name: "", url: "", token: "", requestBody: "" });
  };

  const handleEdit = (term: MonitoredTerm) => {
    setEditingId(term.id);
    setIsAdding(false);
    setFormData({ 
      name: term.name, 
      url: term.url, 
      token: term.token, 
      requestBody: term.requestBody 
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", url: "", token: "", requestBody: "" });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("O nome do termo é obrigatório");
      return;
    }

    if (!formData.url.trim()) {
      toast.error("A URL da API é obrigatória");
      return;
    }

    // Validar JSON se fornecido
    if (formData.requestBody.trim()) {
      try {
        JSON.parse(formData.requestBody);
      } catch {
        toast.error("O JSON de requisição está inválido");
        return;
      }
    }

    if (isAdding) {
      const newTerm: MonitoredTerm = {
        id: Date.now().toString(),
        name: formData.name,
        url: formData.url,
        token: formData.token,
        requestBody: formData.requestBody,
      };
      setTerms({
        ...terms,
        [currentPillar]: [...terms[currentPillar], newTerm],
      });
      toast.success("Termo adicionado com sucesso");
    } else if (editingId) {
      setTerms({
        ...terms,
        [currentPillar]: terms[currentPillar].map((term) =>
          term.id === editingId
            ? { 
                ...term, 
                name: formData.name, 
                url: formData.url,
                token: formData.token,
                requestBody: formData.requestBody
              }
            : term
        ),
      });
      toast.success("Termo atualizado com sucesso");
    }

    handleCancel();
  };

  const handleDeleteClick = (id: string) => {
    setTermToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (termToDelete) {
      setTerms({
        ...terms,
        [currentPillar]: terms[currentPillar].filter((term) => term.id !== termToDelete),
      });
      toast.success("Termo deletado com sucesso");
      setTermToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const currentTerms = terms[currentPillar];

  return (
    <div className="space-y-4">
      {/* Header com navegação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold min-w-[200px] text-center">
            {currentPillarData.label}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={handleAdd} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Novo
        </Button>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Termo Monitorado</TableHead>
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Linha de adicionar novo */}
            {isAdding && (
              <TableRow className="bg-muted/50">
                <TableCell colSpan={2}>
                  <div className="space-y-4 p-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Termo</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Digite o nome do termo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="url">URL da API</Label>
                      <Input
                        id="url"
                        type="url"
                        value={formData.url}
                        onChange={(e) =>
                          setFormData({ ...formData, url: e.target.value })
                        }
                        placeholder="https://api.exemplo.com/endpoint"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="token">Token de Autenticação</Label>
                      <Input
                        id="token"
                        type="password"
                        value={formData.token}
                        onChange={(e) =>
                          setFormData({ ...formData, token: e.target.value })
                        }
                        placeholder="Bearer token ou API key"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="requestBody">JSON de Requisição (opcional)</Label>
                      <Textarea
                        id="requestBody"
                        value={formData.requestBody}
                        onChange={(e) =>
                          setFormData({ ...formData, requestBody: e.target.value })
                        }
                        placeholder='{"key": "value"}'
                        rows={6}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        JSON que será enviado no corpo da requisição
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} size="sm" className="gap-2">
                        <Save className="h-4 w-4" />
                        Salvar
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Linhas de termos existentes */}
            {currentTerms.map((term) => (
              <TableRow key={term.id}>
                <TableCell>
                  {editingId === term.id ? (
                    <div className="space-y-4 p-4">
                      <div className="space-y-2">
                        <Label htmlFor={`edit-name-${term.id}`}>
                          Nome do Termo
                        </Label>
                        <Input
                          id={`edit-name-${term.id}`}
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Digite o nome do termo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-url-${term.id}`}>
                          URL da API
                        </Label>
                        <Input
                          id={`edit-url-${term.id}`}
                          type="url"
                          value={formData.url}
                          onChange={(e) =>
                            setFormData({ ...formData, url: e.target.value })
                          }
                          placeholder="https://api.exemplo.com/endpoint"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-token-${term.id}`}>
                          Token de Autenticação
                        </Label>
                        <Input
                          id={`edit-token-${term.id}`}
                          type="password"
                          value={formData.token}
                          onChange={(e) =>
                            setFormData({ ...formData, token: e.target.value })
                          }
                          placeholder="Bearer token ou API key"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-requestBody-${term.id}`}>
                          JSON de Requisição (opcional)
                        </Label>
                        <Textarea
                          id={`edit-requestBody-${term.id}`}
                          value={formData.requestBody}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              requestBody: e.target.value,
                            })
                          }
                          placeholder='{"key": "value"}'
                          rows={6}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          JSON que será enviado no corpo da requisição
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSave} size="sm" className="gap-2">
                          <Save className="h-4 w-4" />
                          Salvar
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <span className="font-medium">{term.name}</span>
                  )}
                </TableCell>
                <TableCell>
                  {editingId !== term.id && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(term)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(term.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {/* Mensagem quando não há termos */}
            {currentTerms.length === 0 && !isAdding && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                  Nenhum termo monitorado. Clique em "Adicionar Novo" para começar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este termo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

