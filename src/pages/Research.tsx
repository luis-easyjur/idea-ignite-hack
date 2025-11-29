import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Loader2 } from "lucide-react";
import { CAPESStudy } from "@/types/capes";
import { CAPESStudyCard } from "@/components/research/CAPESStudyCard";
import { CAPESStudyDetailModal } from "@/components/research/CAPESStudyDetailModal";
import { useCAPESStudies } from "@/hooks/useCAPESStudies";
import { CAPES_RESOURCE_IDS } from "@/types/capes";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Research = () => {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Aumentado para 50 itens por página
  const [selectedStudy, setSelectedStudy] = useState<CAPESStudy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Query CAPES API - busca automática dos últimos 2 anos com limite de 500
  const { data: capesData, isLoading, error } = useCAPESStudies({
    query: searchQuery,
    limit: isInitialLoad ? 500 : itemsPerPage, // 500 no load inicial, 50 após busca
    offset: isInitialLoad ? 0 : (currentPage - 1) * itemsPerPage,
    multiYear: isInitialLoad, // Busca múltiplos anos no load inicial
  });

  // Carregar estudos automaticamente ao montar o componente
  useEffect(() => {
    // Dispara busca vazia = carrega todos os estudos dos últimos 2 anos
    setSearchQuery('');
  }, []);

  // Reset para página 1 quando busca mudar
  useEffect(() => {
    setCurrentPage(1);
    setIsInitialLoad(false); // Após primeira busca, desativa modo inicial
  }, [searchQuery]);

  const handleSearch = () => {
    setSearchQuery(inputValue);
    setCurrentPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const studies = capesData?.studies || [];
  const totalRecords = capesData?.total || 0;
  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  // Gerar números de página com elipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handleViewDetails = (study: CAPESStudy) => {
    setSelectedStudy(study);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Estudos Científicos
              </h1>
              <p className="text-muted-foreground mt-1">
                Base CAPES de teses e dissertações brasileiras
              </p>
            </div>
          </div>

          {/* Campo de Busca */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Buscar por título, autor, palavra-chave..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-12 h-12 text-base"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="h-12 px-8"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Buscar
                </Button>
              </div>
              <div className="mt-3 text-sm text-muted-foreground text-center">
                {totalRecords > 0 && `${totalRecords.toLocaleString('pt-BR')} estudos encontrados`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Estudos */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-semibold mb-2">
                  Carregando estudos...
                </h3>
                <p className="text-muted-foreground">
                  Buscando dados da API CAPES
                </p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Erro ao carregar estudos
                </h3>
                <p className="text-muted-foreground">
                  {error.message}
                </p>
              </CardContent>
            </Card>
          ) : studies.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Nenhum estudo encontrado
                </h3>
                <p className="text-muted-foreground">
                  Tente buscar por outro termo
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studies.map((study) => (
                <CAPESStudyCard
                  key={study.id}
                  study={study}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>

        {/* Study Detail Modal */}
        <CAPESStudyDetailModal
          study={selectedStudy}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {/* Paginação */}
        {studies.length > 0 && totalPages > 1 && (
          <Card>
            <CardContent className="py-6">
              <div className="flex flex-col items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </div>

                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {getPageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === "ellipsis" ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => setCurrentPage(page as number)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Research;
