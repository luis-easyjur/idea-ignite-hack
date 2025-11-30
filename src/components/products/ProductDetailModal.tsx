import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ElasticProduct } from "@/types/products";
import { Building2, Leaf, Beaker, Target, CheckCircle2, XCircle } from "lucide-react";

interface ProductDetailModalProps {
  product: ElasticProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductDetailModal = ({ product, open, onOpenChange }: ProductDetailModalProps) => {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            {product.nome_comercial || product.titular_registro}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-lg">Empresa Detentora</h3>
            </div>
            <p className="text-muted-foreground">{product.titular_registro}</p>
            <div className="mt-2">
              <Badge variant={product.source === 'agrofit' ? 'default' : 'outline'}>
                {product.source === 'agrofit' ? 'AGROFIT' : 'Bioinsumos'}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Informações Gerais */}
          <div>
            <h3 className="font-semibold text-lg mb-3">📋 Informações Gerais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Formulação</p>
                <p className="font-medium">{product.formulacao || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Classificação Toxicológica</p>
                <p className="font-medium">{product.classificacao_toxicologica || 'Não informado'}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Produto Biológico:</p>
                {product.produto_biologico ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Produto Orgânico:</p>
                {product.produto_organico ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Ingredientes Ativos */}
          {product.ingrediente_ativo_nome && product.ingrediente_ativo_nome.length > 0 && (
            <>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Beaker className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold text-lg">Ingredientes Ativos</h3>
                </div>
                <div className="space-y-2">
                  {product.ingrediente_ativo_nome.map((ingrediente, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-muted/50">
                      <p className="font-medium">{ingrediente}</p>
                      {product.grupo_quimico[idx] && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Grupo Químico: {product.grupo_quimico[idx]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Categorias */}
          {product.classe_categoria && product.classe_categoria.length > 0 && (
            <>
              <div>
                <h3 className="font-semibold text-lg mb-3">🏷️ Categorias</h3>
                <div className="flex flex-wrap gap-2">
                  {product.classe_categoria.map((cat, idx) => (
                    <Badge key={idx} variant="secondary">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Indicações de Uso */}
          {product.indicacao_uso && product.indicacao_uso.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg">Culturas e Pragas</h3>
              </div>
              <div className="space-y-3">
                {product.indicacao_uso.map((indicacao, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium text-primary mb-2">{indicacao.cultura}</p>
                    {indicacao.praga_nome_comum && Array.isArray(indicacao.praga_nome_comum) && indicacao.praga_nome_comum.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {indicacao.praga_nome_comum.map((praga, pIdx) => (
                          <Badge key={pIdx} variant="outline" className="text-xs">
                            {praga}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
