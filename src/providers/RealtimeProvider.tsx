/**
 * RealtimeProvider — Supabase Realtime cross-device sync
 *
 * Subscribes to postgres_changes on `materials` and `solicitudes`. Any write
 * from ANY device (phone, web, background job) fires an event that immediately
 * invalidates the relevant React Query caches on every connected client.
 *
 * This is why data now stays in sync across devices without manual refresh.
 */
import { type ReactNode, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { supabase } from '../services/supabase';
import { materialsKeys } from '../pages/Inventory/List/hooks/useGetMaterials';

type Props = { children: ReactNode };

export const RealtimeProvider = ({ children }: Props) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const invalidateMaterials = () => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.all() });
      queryClient.invalidateQueries({ queryKey: ['my-materials'] });
      queryClient.invalidateQueries({ queryKey: ['my-materials-with-confirmation'] });
      queryClient.invalidateQueries({ queryKey: ['confirmation-materials'] });
      queryClient.invalidateQueries({ queryKey: ['notificaciones-layout'] });
      queryClient.invalidateQueries({ queryKey: ['notificaciones-local'] });
      queryClient.invalidateQueries({ queryKey: ['confirmaciones'] });
    };

    const invalidateSolicitudes = () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
    };

    const channel = supabase
      .channel('proa-track-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'materials' },
        invalidateMaterials,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'solicitudes' },
        invalidateSolicitudes,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return <>{children}</>;
};
