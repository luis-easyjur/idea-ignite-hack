import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PatentByYear {
  year: number;
  count: number;
}

interface TopCompany {
  company: string;
  count: number;
}

interface CategoryDistribution {
  category: string;
  count: number;
}

export const usePatentDashboardStats = () => {
  return useQuery({
    queryKey: ['patent-dashboard-stats'],
    queryFn: async () => {
      // Fetch all patents data
      const { data: patents, error } = await supabase
        .from('patents')
        .select('*');

      if (error) throw error;
      if (!patents) return null;

      // Calculate stats
      const total = patents.length;
      const granted = patents.filter(p => p.status === 'Concedida').length;
      const withAbstract = patents.filter(p => p.abstract).length;

      // Patents by year (last 5 years with data)
      const yearCounts = patents.reduce((acc, patent) => {
        const year = new Date(patent.filing_date).getFullYear();
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const byYear: PatentByYear[] = Object.entries(yearCounts)
        .map(([year, count]) => ({ year: parseInt(year), count: count as number }))
        .sort((a, b) => b.year - a.year)
        .slice(0, 5);

      // Top 5 companies
      const companyCounts = patents.reduce((acc, patent) => {
        acc[patent.company] = (acc[patent.company] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topCompanies: TopCompany[] = Object.entries(companyCounts)
        .map(([company, count]) => ({ company, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Category distribution
      const categoryCounts = patents.reduce((acc, patent) => {
        acc[patent.category] = (acc[patent.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const categories: CategoryDistribution[] = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count: count as number }))
        .sort((a, b) => b.count - a.count);

      // Unique companies and inventors
      const uniqueCompanies = new Set(patents.map(p => p.company)).size;
      
      const allInventors = patents
        .filter(p => p.inventors && p.inventors.length > 0)
        .flatMap(p => p.inventors || []);
      
      const inventorCounts = allInventors.reduce((acc, inventor) => {
        acc[inventor] = (acc[inventor] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topInventors = Object.entries(inventorCounts)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Find year with most patents
      const peakYear = byYear.length > 0 ? byYear.reduce((a, b) => a.count > b.count ? a : b) : null;

      return {
        total,
        granted,
        uniqueCompanies,
        byYear,
        topCompanies,
        categories,
        withAbstract,
        abstractPercentage: total > 0 ? Math.round((withAbstract / total) * 100) : 0,
        topInventors,
        peakYear,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
