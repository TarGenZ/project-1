import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const TOTAL_SPOTS = { personal: 14, group: 30 };

export function useSpots() {
  const [spots, setSpots] = useState({ personal: 7, group: 9 });

  useEffect(() => {
    async function fetchSpots() {
      const { data } = await supabase
        .from('purchases')
        .select('plan_type')
        .eq('status', 'paid');

      if (data) {
        const personal = data.filter(p => p.plan_type === 'personal').length;
        const group = data.filter(p => p.plan_type === 'group').length;
        setSpots({ personal, group });
      }
    }

    fetchSpots();

    const channel = supabase
      .channel('purchases-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'purchases' }, fetchSpots)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return {
    personal: { taken: spots.personal, total: TOTAL_SPOTS.personal },
    group: { taken: spots.group, total: TOTAL_SPOTS.group },
  };
}
