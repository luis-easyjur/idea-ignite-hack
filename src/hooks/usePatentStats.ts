import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePatentStats = () => {
  return useQuery({
    queryKey: ['patent-stats'],
    queryFn: async () => {
      // Get total count
      const { count: total } = await supabase
        .from('patents')
        .select('*', { count: 'exact', head: true });
      
      // Get patents from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: newLast7Days } = await supabase
        .from('patents')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());
      
      return {
        total: total || 0,
        newLast7Days: newLast7Days || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
