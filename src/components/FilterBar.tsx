import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
export interface FilterState {
  culture?: string;
  region?: string;
  category?: string;
  period?: string;
}
interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
}
const cultures = [{
  value: "soja",
  label: "Soja"
}, {
  value: "milho",
  label: "Milho"
}, {
  value: "cafe",
  label: "Café"
}, {
  value: "cana",
  label: "Cana-de-açúcar"
}, {
  value: "citrus",
  label: "Citrus"
}, {
  value: "algodao",
  label: "Algodão"
}];
const regions = [{
  value: "centro-oeste",
  label: "Centro-Oeste"
}, {
  value: "sudeste",
  label: "Sudeste"
}, {
  value: "sul",
  label: "Sul"
}, {
  value: "nordeste",
  label: "Nordeste"
}, {
  value: "norte",
  label: "Norte"
}];
const categories = [{
  value: "foliar_nutrition",
  label: "Nutrição Foliar"
}, {
  value: "biostimulants",
  label: "Bioestimulantes"
}, {
  value: "biodefensives",
  label: "Biodefensivos"
}, {
  value: "adjuvants",
  label: "Adjuvantes"
}, {
  value: "biofertilizers",
  label: "Biofertilizantes"
}];
const periods = [{
  value: "7d",
  label: "Últimos 7 dias"
}, {
  value: "30d",
  label: "Últimos 30 dias"
}, {
  value: "3m",
  label: "Últimos 3 meses"
}, {
  value: "6m",
  label: "Últimos 6 meses"
}, {
  value: "1y",
  label: "Último ano"
}];
export const FilterBar = ({
  onFilterChange
}: FilterBarProps) => {
  const [filters, setFilters] = useState<FilterState>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const updateFilter = (key: keyof FilterState, value: string | undefined) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    if (!value) {
      delete newFilters[key];
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };
  const activeFilterCount = Object.keys(filters).length;
  return (
    <Card className="mb-6">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Cultura</label>
              <Select value={filters.culture} onValueChange={(value) => updateFilter('culture', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {cultures.map((culture) => (
                    <SelectItem key={culture.value} value={culture.value}>
                      {culture.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Região</label>
              <Select value={filters.region} onValueChange={(value) => updateFilter('region', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={filters.period} onValueChange={(value) => updateFilter('period', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};