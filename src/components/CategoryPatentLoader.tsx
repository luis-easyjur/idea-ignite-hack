import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Leaf, Shield, Droplets, Sprout, Beaker } from 'lucide-react';
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
    setLoadingCategory(categoryId);

    try {
      let totalResults = 0;
      const categoriesToLoad = categoryId === 'all' ? categories.filter(c => c.id !== 'all').map(c => c.id as ProductCategory) : [categoryId as ProductCategory];

      for (const cat of categoriesToLoad) {
        const queries = getCategoryQueries(cat);
        
        for (const query of queries) {
          const { data, error } = await supabase.functions.invoke('search-google-patents', {
            body: {
              query,
              country: 'BR',
              limit: 20,
              category: cat,
            },
          });

          if (error) {
            console.error(`Erro ao buscar patentes para ${cat}:`, error);
            continue;
          }

          if (data?.results) {
            // Upsert patents into database
            for (const patent of data.results) {
              await supabase.from('patents').upsert({
                patent_number: patent.patent_number,
                publication_number: patent.publication_number,
                title: patent.title,
                abstract: patent.abstract,
                company: patent.company || 'Não informado',
                inventors: patent.inventors || [],
                filing_date: patent.filing_date,
                priority_date: patent.priority_date,
                publication_date: patent.publication_date,
                grant_date: patent.grant_date,
                status: patent.status,
                category: cat,
                google_patents_link: patent.google_patents_link,
                pdf_url: patent.pdf_url,
                thumbnail_url: patent.thumbnail_url,
                language: 'pt',
              }, {
                onConflict: 'patent_number',
              });
            }
            totalResults += data.results.length;
          }
        }
      }

      setLastSync(new Date());
      toast.success(`${totalResults} patentes carregadas com sucesso!`);
      onLoadComplete();
    } catch (error) {
      console.error('Erro ao carregar patentes:', error);
      toast.error('Erro ao carregar patentes do Google Patents');
    } finally {
      setLoadingCategory(null);
    }
  };

  return (
    <Card className="p-6 mb-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">📋 Carregar patentes por tema</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Busque automaticamente patentes do Google Patents por categoria de produto
          </p>
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
                disabled={loadingCategory !== null}
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
            disabled={loadingCategory !== null}
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
