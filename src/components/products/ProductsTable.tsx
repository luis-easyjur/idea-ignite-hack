import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { ElasticProduct } from "@/types/products";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ProductsTableProps {
  products: ElasticProduct[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetails: (product: ElasticProduct) => void;
}

export const ProductsTable = ({
  products,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onViewDetails,
}: ProductsTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">Nenhum produto encontrado</p>
        <p className="text-sm mt-2">Tente ajustar os filtros de busca</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto / Empresa</TableHead>
              <TableHead>Categorias</TableHead>
              <TableHead>Fonte</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{product.nome_comercial || product.titular_registro}</span>
                    <span className="text-sm text-muted-foreground">{product.titular_registro}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {product.classe_categoria?.slice(0, 2).map((cat, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                    {product.classe_categoria?.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{product.classe_categoria.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={product.source === 'agrofit' ? 'default' : 'outline'}>
                    {product.source === 'agrofit' ? 'AGROFIT' : 'Bioinsumos'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(product)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {products.map((product) => (
          <Card key={product.id} className="p-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm leading-tight">{product.nome_comercial || product.titular_registro}</h4>
                <p className="text-xs text-muted-foreground mt-1">{product.titular_registro}</p>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {product.classe_categoria?.slice(0, 3).map((cat, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
                {product.classe_categoria?.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{product.classe_categoria.length - 3}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <Badge variant={product.source === 'agrofit' ? 'default' : 'outline'} className="text-xs">
                  {product.source === 'agrofit' ? 'AGROFIT' : 'Bioinsumos'}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(product)}
                  className="gap-1 text-xs h-8"
                >
                  <Eye className="h-3 w-3" />
                  Detalhes
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => onPageChange(pageNum)}
                    isActive={currentPage === pageNum}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
