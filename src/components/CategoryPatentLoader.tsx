import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Leaf, Shield, Droplets, Sprout, Beaker, AlertCircle } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type ProductCategory = Database['public']['Enums']['product_category'];

interface CategoryPatentLoaderProps {
  onLoadComplete: () => void;
}

interface CategoryConfig {
  id: ProductCategory | 'all';
  label: string;
  icon: typeof Leaf;
  color: string;
}

// Check if BigQuery quota is exceeded
const checkQuotaStatus = () => {
  const quotaStatus = localStorage.getItem('bigquery_quota_exceeded');
  if (quotaStatus) {
    const { exceeded, month, year } = JSON.parse(quotaStatus);
    const now = new Date();
    if (now.getMonth() === month && now.getFullYear() === year) {
      return exceeded;
    } else {
      localStorage.removeItem('bigquery_quota_exceeded');
      return false;
    }
  }
  return false;
};

const markQuotaExceeded = () => {
  const now = new Date();
  localStorage.setItem('bigquery_quota_exceeded', JSON.stringify({
    exceeded: true,
    month: now.getMonth(),
    year: now.getFullYear()
  }));
};

const getNextQuotaReset = () => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
};

const categories: CategoryConfig[] = [
  { id: 'biostimulants', label: 'Bioestimulantes', icon: Leaf, color: 'bg-green-500/10 text-green-600 hover:bg-green-500/20' },
  { id: 'biodefensives', label: 'Biodefensivos', icon: Shield, color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20' },
  { id: 'foliar_nutrition', label: 'Nutrição Foliar', icon: Sprout, color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' },
  { id: 'adjuvants', label: 'Adjuvantes', icon: Droplets, color: 'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20' },
  { id: 'biofertilizers', label: 'Biofertilizantes', icon: Beaker, color: 'bg-lime-500/10 text-lime-600 hover:bg-lime-500/20' },
];

export function CategoryPatentLoader({ onLoadComplete }: CategoryPatentLoaderProps) {
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(checkQuotaStatus());

  useEffect(() => {
    setQuotaExceeded(checkQuotaStatus());
  }, []);

  const getCategoryQueries = (category: ProductCategory): string[] => {
    const queries: Record<ProductCategory, string[]> = {
      biostimulants: ['bioestimulante agrícola brasil', 'biostimulant crop brazil'],
      biodefensives: ['defensivo biológico brasil', 'biological pesticide brazil'],
      foliar_nutrition: ['nutrição foliar brasil', 'foliar fertilizer brazil'],
      adjuvants: ['adjuvante agrícola brasil', 'spray adjuvant brazil'],
      biofertilizers: ['biofertilizante brasil', 'microbial fertilizer brazil'],
    };
    return queries[category];
  };

  const loadPatentsByCategory = async (categoryId: ProductCategory | 'all') => {
    // Check quota before attempting to load
    if (quotaExceeded) {
      toast.error(
        `BigQuery indisponível - Quota mensal (1TB) excedida. Reset em ${getNextQuotaReset()}.`,
        { duration: 5000 }
      );
      return;
    }

    setLoadingCategory(categoryId);
    const startTime = Date.now();

    try {
      let totalResults = 0;
      let totalQueries = 0;
      const categoriesToLoad = categoryId === 'all' ? categories.filter(c => c.id !== 'all').map(c => c.id as ProductCategory) : [categoryId as ProductCategory];

      toast.info(`🔍 Buscando patentes brasileiras via BigQuery...`, { duration: 2000 });

      for (const cat of categoriesToLoad) {
        const queries = getCategoryQueries(cat);
        
        for (const query of queries) {
          totalQueries++;
          console.log(`[CategoryLoader] Query ${totalQueries}: ${query}`);
          
          const { data, error } = await supabase.functions.invoke('search-patents-bigquery', {
            body: {
              query,
              category: cat,
              startDate: '20200101', // Last 5 years
              endDate: new Date().toISOString().split('T')[0].replace(/-/g, ''),
              limit: 50,
            },
          });

          if (error) {
            console.error(`Erro ao buscar patentes para ${cat}:`, error);
            toast.error(`Erro na busca: ${cat}`);
            continue;
          }
          
          // Check if response contains quota error
          if (data?.error && data.error.includes("Quota exceeded")) {
            markQuotaExceeded();
            setQuotaExceeded(true);
            toast.error(
              `Quota mensal do BigQuery excedida (1TB). Reset em ${getNextQuotaReset()}.`,
              { duration: 6000 }
            );
            setLoadingCategory(null);
            return;
          }

          if (data?.results && data.results.length > 0) {
            console.log(`[CategoryLoader] Encontradas ${data.results.length} patentes para query: ${query}`);
            
            // Upsert patents into database with date validation
            const { error: upsertError } = await supabase.from('patents').upsert(
              data.results.map((patent: any) => ({
                patent_number: patent.patent_number,
                publication_number: patent.publication_number,
                title: patent.title,
                abstract: patent.abstract,
                company: patent.company || 'Não informado',
                inventors: patent.inventors || [],
                filing_date: patent.filing_date || '1900-01-01', // Fallback obrigatório
                priority_date: patent.priority_date || null,
                publication_date: patent.publication_date || null,
                grant_date: patent.grant_date || null,
                status: patent.status,
                category: cat,
                google_patents_link: patent.google_patents_link,
                pdf_url: patent.pdf_url,
                thumbnail_url: patent.thumbnail_url,
                language: 'pt',
              })),
              { onConflict: 'patent_number' }
            );

            if (upsertError) {
              console.error('Erro ao salvar patentes:', upsertError);
              toast.error('Erro ao salvar patentes no banco');
            } else {
              totalResults += data.results.length;
              console.log(`[CategoryLoader] ${data.results.length} patentes salvas no banco`);
            }
          } else {
            console.log(`[CategoryLoader] Nenhuma patente encontrada para: ${query}`);
          }
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      setLastSync(new Date());
      
      if (totalResults > 0) {
        toast.success(`✅ ${totalResults} patentes brasileiras carregadas via BigQuery em ${duration}s!`, {
          description: `${totalQueries} consultas realizadas no Google Patents Public Data`,
        });
      } else {
        toast.warning(`Nenhuma patente encontrada nas ${totalQueries} consultas ao BigQuery`);
      }
      
      onLoadComplete();
    } catch (error: any) {
      console.error('Erro ao carregar patentes:', error);
      
      // Check if error message contains quota exceeded
      const errorMsg = error?.message || JSON.stringify(error);
      if (errorMsg.includes("Quota exceeded")) {
        markQuotaExceeded();
        setQuotaExceeded(true);
        toast.error(
          `Quota mensal do BigQuery excedida (1TB). Reset em ${getNextQuotaReset()}.`,
          { duration: 6000 }
        );
      } else {
        toast.error('Erro ao carregar patentes do Google Patents', {
          description: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    } finally {
      setLoadingCategory(null);
    }
  };

  return (
    <Card className="p-6 mb-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            📋 Carregar patentes brasileiras via BigQuery
            {quotaExceeded && (
              <span className="text-xs font-normal text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Indisponível
              </span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Busque automaticamente patentes brasileiras reais do repositório oficial Google Patents Public Data
          </p>
          {quotaExceeded && (
            <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 p-2 rounded border border-amber-200 dark:border-amber-800">
              ⚠️ BigQuery temporariamente indisponível (quota mensal de 1TB excedida). Reset em <strong>{getNextQuotaReset()}</strong>.
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isLoading = loadingCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant="outline"
                size="sm"
                className={category.color}
                onClick={() => loadPatentsByCategory(category.id)}
                disabled={loadingCategory !== null || quotaExceeded}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="mr-2 h-4 w-4" />
                )}
                {category.label}
              </Button>
            );
          })}
          
          <Button
            variant="default"
            size="sm"
            onClick={() => loadPatentsByCategory('all')}
            disabled={loadingCategory !== null || quotaExceeded}
          >
            {loadingCategory === 'all' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              '🔄'
            )}
            Carregar Todos
          </Button>
        </div>

        {lastSync && (
          <p className="text-xs text-muted-foreground">
            Última sincronização: {lastSync.toLocaleDateString('pt-BR')} às {lastSync.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </Card>
  );
}
