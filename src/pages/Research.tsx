import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Unlock, TrendingUp } from "lucide-react";
import { mockStudies } from "@/data/research-studies";
import { Study } from "@/types/research";
import { StudyCard } from "@/components/research/StudyCard";
import { StudyDetailModal } from "@/components/research/StudyDetailModal";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [oaFilter, setOaFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reset para página 1 quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, yearFilter, oaFilter, typeFilter]);

  // Filtrar estudos
  const filteredStudies = mockStudies.filter((study) => {
    const matchesSearch =
      searchQuery === "" ||
      study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.authorships.some((auth) =>
        auth.author.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      study.keywords?.some((kw) =>
        kw.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesYear =
      yearFilter === "all" || study.publication_year.toString() === yearFilter;

    const matchesOA =
      oaFilter === "all" || study.open_access.oa_status === oaFilter;

    const matchesType = typeFilter === "all" || study.type === typeFilter;

    return matchesSearch && matchesYear && matchesOA && matchesType;
  });

  // Paginação
  const totalPages = Math.ceil(filteredStudies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudies = filteredStudies.slice(startIndex, endIndex);

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

  const handleViewDetails = (study: Study) => {
    setSelectedStudy(study);
    setIsModalOpen(true);
  };

  // Extrair anos únicos
  const uniqueYears = Array.from(new Set(mockStudies.map((s) => s.publication_year))).sort(
    (a, b) => b - a
  );

  // Estatísticas
  const stats = {
    total: mockStudies.length,
    openAccess: mockStudies.filter((s) => s.open_access.is_oa).length,
    avgCitations: Math.round(
      mockStudies.reduce((sum, s) => sum + s.cited_by_count, 0) / mockStudies.length
    ),
    topPercentile: mockStudies.filter(
      (s) => s.citation_normalized_percentile?.is_in_top_10_percent
    ).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Estudos Científicos
              </h1>
              <p className="text-muted-foreground mt-1">
                Base de conhecimento de pesquisas científicas relevantes
              </p>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardDescription>Total de Estudos</CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-l-4 border-l-success">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-1">
                  <Unlock className="h-3 w-3" />
                  Acesso Aberto
                </CardDescription>
                <CardTitle className="text-3xl">
                  {stats.openAccess}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({Math.round((stats.openAccess / stats.total) * 100)}%)
                  </span>
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-l-4 border-l-secondary">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Média de Citações
                </CardDescription>
                <CardTitle className="text-3xl">{stats.avgCitations}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-l-4 border-l-warning">
              <CardHeader className="pb-3">
                <CardDescription>Top 10% Impacto</CardDescription>
                <CardTitle className="text-3xl">
                  {stats.topPercentile}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({Math.round((stats.topPercentile / stats.total) * 100)}%)
                  </span>
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros de Pesquisa</CardTitle>
            <CardDescription>
              Refine sua busca por estudos científicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Busca */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por título, autor ou palavra-chave..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro de Ano */}
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Ano de publicação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os anos</SelectItem>
                  {uniqueYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro de Acesso Aberto */}
              <Select value={oaFilter} onValueChange={setOaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Acesso Aberto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="gold">Dourado</SelectItem>
                  <SelectItem value="green">Verde</SelectItem>
                  <SelectItem value="hybrid">Híbrido</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="closed">Restrito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Tipo (segunda linha) */}
            <div className="mt-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de publicação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="review">Revisão</SelectItem>
                  <SelectItem value="article">Artigo</SelectItem>
                  <SelectItem value="book-chapter">Capítulo de Livro</SelectItem>
                  <SelectItem value="preprint">Pré-print</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Resultado da busca e controles */}
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {filteredStudies.length === 0 ? (
                  "Nenhum estudo encontrado"
                ) : (
                  <>
                    Mostrando {startIndex + 1}-{Math.min(endIndex, filteredStudies.length)} de{" "}
                    {filteredStudies.length} estudos
                  </>
                )}
              </div>

              {/* Seletor de itens por página */}
              {filteredStudies.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Itens por página:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Estudos */}
        <div className="space-y-4">
          {paginatedStudies.map((study) => (
            <StudyCard
              key={study.id}
              study={study}
              onViewDetails={() => handleViewDetails(study)}
            />
          ))}

          {filteredStudies.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Nenhum estudo encontrado
                </h3>
                <p className="text-muted-foreground">
                  Tente ajustar seus filtros de pesquisa
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Study Detail Modal */}
        <StudyDetailModal
          study={selectedStudy}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />

        {/* Paginação */}
        {filteredStudies.length > 0 && totalPages > 1 && (
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
