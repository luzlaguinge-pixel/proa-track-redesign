import { useQuery } from '@tanstack/react-query';

import { TIPO_LABEL } from '../../Inventory/List/constants';
import { getAllMaterials } from '../../Inventory/store';

import { type Country } from './useCountryFilter';

export type AlertTipo =
  | 'perdido'
  | 'reparacion'
  | 'linea'
  | 'baja_pendiente'
  | 'confirmacion_vencida';

export type AlertItem = {
  id: string;
  label: string;
  sublabel?: string;
  motivo: string;
  tipo: AlertTipo;
  linkTo: string;
};

export type DashboardStats = {
  total: number;
  enUso: number;
  utilizacionPct: number;
  disponible: number;
  sinMovimiento90: number;
  perdidos: number;
  enReparacion: number;
  alertas: AlertItem[];
  // TODO: trendTotal, trendEnUso, trendPerdidos — requiere GET /stats/monthly-snapshot
  // TODO: valorInventario, valorPerdidos — requiere campo `value` en Material (GET /materials/economic-summary)
};

const getDashboardStats = (country: Country): DashboardStats => {
  const all = getAllMaterials();
  const materials =
    country === 'todos' ? all : all.filter(m => m.pais === country);

  const total = materials.length;
  const enUso = materials.filter(m => m.estado === 'en_uso').length;
  const utilizacionPct = total > 0 ? Math.round((enUso / total) * 100) : 0;
  const disponible = materials.filter(m => m.estado === 'sin_uso').length;
  const perdidos = materials.filter(m => m.estado === 'perdida').length;
  const enReparacion = materials.filter(
    m => m.estado === 'en_reparacion',
  ).length;

  const today = new Date();
  const sinMovimiento90 = materials.filter(m => {
    if (m.estado !== 'sin_uso') return false;
    const days =
      (today.getTime() - new Date(m.fechaActualizacion).getTime()) / 86_400_000;
    return days > 90;
  }).length;

  const alertas: AlertItem[] = [];

  for (const m of materials) {
    const label = TIPO_LABEL[m.tipo];
    const sublabel = m.detalle || undefined;

    if (m.estado === 'perdida') {
      alertas.push({
        id: m.id,
        label,
        sublabel,
        motivo: 'Perdido',
        tipo: 'perdido',
        linkTo: `/inventory/${m.id}`,
      });
    } else if (m.estado === 'en_reparacion') {
      alertas.push({
        id: m.id,
        label,
        sublabel,
        motivo: 'En reparación',
        tipo: 'reparacion',
        linkTo: `/inventory/${m.id}`,
      });
    } else if (
      (m.tipo === 'celular' || m.tipo === 'tablet') &&
      m.estado === 'sin_uso' &&
      m.lineaTelefonica !== null
    ) {
      alertas.push({
        id: m.id,
        label,
        sublabel: m.lineaTelefonica ?? undefined,
        motivo: 'Línea sin responsable',
        tipo: 'linea',
        linkTo: `/inventory/${m.id}`,
      });
    }
  }

  // TODO: bajas_pendiente — requiere campo `estado: 'baja'` en Persona + GET /persons?estado=baja&tiene_materiales=true
  // TODO: confirmaciones_vencidas — requiere tabla confirmaciones + GET /confirmations?vencido=true

  return {
    total,
    enUso,
    utilizacionPct,
    disponible,
    sinMovimiento90,
    perdidos,
    enReparacion,
    alertas,
  };
};

export const useDashboardStats = (country: Country) => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats', country],
    queryFn: () => getDashboardStats(country),
  });
  return { stats: data ?? null, isLoading };
};
