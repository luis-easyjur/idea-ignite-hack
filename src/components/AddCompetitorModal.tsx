import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AddCompetitorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddCompetitorModal = ({ open, onOpenChange, onSuccess }: AddCompetitorModalProps) => {
  const [name, setName] = useState("");
  const [segment, setSegment] = useState("");
  const [website, setWebsite] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome da empresa é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("competitors").insert({
        name: name.trim(),
        segment: segment.trim() || null,
        website: website.trim() || null,
        cnpj: cnpj.trim() || null,
        notes: notes.trim() || null,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Concorrente adicionado",
        description: `${name} foi adicionado com sucesso.`,
      });

      // Reset form
      setName("");
      setSegment("");
      setWebsite("");
      setCnpj("");
      setNotes("");
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding competitor:", error);
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar o concorrente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Concorrente</DialogTitle>
          <DialogDescription>
            Cadastre um novo concorrente para monitoramento
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Empresa *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Stoller do Brasil"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="segment">Segmento</Label>
            <Input
              id="segment"
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              placeholder="Ex: Bioestimulantes, Defensivos"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
