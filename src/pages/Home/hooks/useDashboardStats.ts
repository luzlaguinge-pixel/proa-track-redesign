import { useQuery } from '@tanstack/react-query';

import { TIPO_LABEL } from '../../Inventory/List/constants';
import { getAllMaterials } from '../../Inventory/store';

export type AlertItem = {
  id: string;
  label: string;
  motivo: string;
  tipo: 'perdido' | 'reparacion' | 'linea';
};

export type DashboardStats = {
  total: number;
  enUso: number;
  sinAsignar: number;
  perdidos: number;
  enReparacion: number;
  alertas: AlertItem[];
};

const getDashboardStats = (): DashboardStats => {
  const materials = getAllMaterials();

  const total = materials.length;
  const enUso = materials.filter(m => m.estado === 'en_uso').length;
  const sinAsignar = materials.filter(m => m.estado === 'sin_uso').length;
  const perdidos = materials.filter(m => m.estado === 'perdida').length;
  const enReparacion = materials.filter(m => m.estado === 'en_reparacion').length;

  const alertas: AlertItem[] = [];

  for (const m of materials) {
    const label = `${TIPO_LABEL[m.tipo]}${m.detalle ? ` · ${m.detalle}` : ''}`;

    if (m.estado === 'perdida') {
      alertas.push({ id: m.id, label, motivo: 'Perdido', tipo: 'perdido' });
    } else if (m.estado === 'en_reparacion') {
      alertas.push({ id: m.id, label, motivo: 'En reparación', tipo: 'reparacion' });
    } else if (
      (m.tipo === 'celular' || m.tipo === 'tablet') &&
      m.estado === 'sin_uso' &&
      m.lineaTelefonica !== null
    ) {
      alertas.push({ id: m.id, label, motivo: 'Línea activa sin responsable', tipo: 'linea' });
    }
  }

  return { total, enUso, sinAsignar, perdidos, enReparacion, alertas };
};

export const useDashboardStats = (): { stats: DashboardStats | null; isLoading: boolean } => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
  });

  return { stats: data ?? null, isLoading };
};
