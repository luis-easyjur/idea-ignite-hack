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
  return;
};