import { useState } from "react";
import { BookOpen, Filter, Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Author {
  id: string;
  display_name: string;
  orcid?: string;
}

interface Source {
  display_name: string;
  issn_l?: string;
  type: string;
}

interface Topic {
  id: string;
  display_name: string;
  score: number;
}

interface Study {
  id: string;
  doi?: string;
  title: string;
  display_name: string;
  publication_year: number;
  publication_date: string;
  relevance_score: number;
  open_access: {
    is_oa: boolean;
    oa_status: string;
    oa_url?: string;
  };
  authorships: Array<{
    author: Author;
  }>;
  primary_location: {
    source: Source;
    landing_page_url?: string;
  };
  primary_topic?: Topic;
  topics?: Topic[];
  cited_by_count: number;
  keywords?: Array<{
    display_name: string;
    score: number;
  }>;
}

// Mock data for demonstration
const mockStudies: Study[] = [
  {
    id: "W4412713698",
    doi: "https://doi.org/10.1016/j.scienta.2025.114300",
    title: "Microbial inoculants enhance walnut yield and soil health",
    display_name: "Microbial inoculants enhance walnut yield and soil health",
    relevance_score: 45.9,
    publication_year: 2025,
    publication_date: "2025-07-25",
    open_access: {
      is_oa: true,
      oa_status: "gold",
      oa_url: "https://doi.org/10.1016/j.scienta.2025.114300"
    },
    authorships: [
      { author: { id: "A1", display_name: "Qiqi Chen" } },
      { author: { id: "A2", display_name: "Gang Chen", orcid: "https://orcid.org/0000-0002-6476-7812" } }
    ],
    primary_location: {
      source: {
        display_name: "Scientia Horticulturae",
        issn_l: "0304-4238",
        type: "journal"
      },
      landing_page_url: "https://doi.org/10.1016/j.scienta.2025.114300"
    },
    primary_topic: {
      id: "T10004",
      display_name: "Soil Carbon and Nitrogen Dynamics",
      score: 0.99
    },
    topics: [
      { id: "T10004", display_name: "Soil Carbon and Nitrogen Dynamics", score: 0.99 },
      { id: "T12436", display_name: "Agronomic Practices and Intercropping Systems", score: 0.98 }
    ],
    cited_by_count: 0,
    keywords: [
      { display_name: "Microbial inoculant", score: 0.92 },
      { display_name: "Yield", score: 0.72 },
      { display_name: "Horticulture", score: 0.51 }
    ]
  }
];

const Research = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [oaFilter, setOaFilter] = useState<string>("all");

  const filteredStudies = mockStudies.filter(study => {
    const matchesSearch = study.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = yearFilter === "all" || study.publication_year.toString() === yearFilter;
    const matchesOA = oaFilter === "all" || 
      (oaFilter === "open" && study.open_access.is_oa) ||
      (oaFilter === "closed" && !study.open_access.is_oa);
    
    return matchesSearch && matchesYear && matchesOA;
  });

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Estudos Científicos</h2>
          <p className="text-muted-foreground">
            Pesquisas e publicações científicas relacionadas ao agronegócio
          </p>
        </div>
        <Button size="sm" variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filtros Avançados
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, autor, palavra-chave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os anos</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
            <Select value={oaFilter} onValueChange={setOaFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Acesso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="open">Acesso Aberto</SelectItem>
                <SelectItem value="closed">Restrito</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredStudies.length} {filteredStudies.length === 1 ? 'estudo encontrado' : 'estudos encontrados'}
          </p>
        </div>

        {filteredStudies.map((study) => (
          <Card key={study.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {study.publication_year}
                    </Badge>
                    {study.open_access.is_oa && (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        Acesso Aberto
                      </Badge>
                    )}
                    {study.cited_by_count > 0 && (
                      <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
                        {study.cited_by_count} citações
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl mb-2">{study.display_name}</CardTitle>
                  <CardDescription className="text-sm">
                    {study.authorships.slice(0, 3).map(a => a.author.display_name).join(", ")}
                    {study.authorships.length > 3 && ` e mais ${study.authorships.length - 3}`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {study.primary_location.landing_page_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={study.primary_location.landing_page_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Publicado em:</span> {study.primary_location.source.display_name}
                </p>
                {study.doi && (
                  <p className="text-xs text-muted-foreground">
                    DOI: <a href={study.doi} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{study.doi}</a>
                  </p>
                )}
              </div>

              {study.primary_topic && (
                <div>
                  <Separator className="mb-3" />
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Tópico Principal:</span>
                    <Badge variant="secondary" className="text-xs">
                      {study.primary_topic.display_name}
                    </Badge>
                  </div>
                </div>
              )}

              {study.keywords && study.keywords.length > 0 && (
                <div>
                  <Separator className="mb-3" />
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Palavras-chave:</span>
                    {study.keywords.slice(0, 5).map((keyword, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {keyword.display_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Relevância: {study.relevance_score.toFixed(1)}</span>
                  <span>•</span>
                  <span>{new Date(study.publication_date).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Research;
