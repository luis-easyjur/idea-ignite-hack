import { FileText } from "lucide-react";

interface PatentDescriptionProps {
  description?: string;
  abstract?: string;
}

export const PatentDescription = ({ description, abstract }: PatentDescriptionProps) => {
  if (!description && !abstract) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma descrição disponível
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {abstract && (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Resumo</h3>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            {abstract}
          </p>
        </div>
      )}

      {description && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Descrição Completa da Invenção
          </h3>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
              {description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};