import { useQuery } from '@tanstack/react-query';

import db from '../../../../mock/db.json';
import { TIPO_LABEL } from '../../Inventory/List/constants';
import { getAllMaterials } from '../../Inventory/store';
import {
  getAllPendingRecovery,
  getOverduePendingRecovery,
  isExcludedFromActiveViews,
} from '../../People/lifecycleStore';

import { type Country } from './useCountryFilter';

export type AlertTipo =
  | 'perdido'
  | 'reparacion'
  | 'linea'
  | 'baja_pendiente'
  | 'baja_escalada'
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
  personasActivas: number;
  personasConMateriales: number;
  alertas: AlertItem[];
};

const getDashboardStats = async (country: Country): Promise<DashboardStats> => {
  const all = await getAllMaterials();
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

  // ── People metrics ────────────────────────────────────────────────────────
  // biome-ignore lint/suspicious/noExplicitAny: mock data structure is dynamic
  const mockPersons: any[] = (db as any).persons ?? [];
  const personasActivas = mockPersons.filter(
    p => !isExcludedFromActiveViews(p.id as string),
  ).length;

  // Unique responsible people who have at least one 'en_uso' material
  const conMateriales = new Set(
    materials
      .filter(m => m.estado === 'en_uso' && !!m.responsableNombre)
      .map(m => m.responsableNombre as string),
  );
  const personasConMateriales = conMateriales.size;

  // ── Alerts ────────────────────────────────────────────────────────────────
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

  // ── Pending-recovery alerts ───────────────────────────────────────────────
  const overdue = new Set(getOverduePendingRecovery().map(r => r.id));

  for (const record of getAllPendingRecovery()) {
    const isOverdue = overdue.has(record.id);
    alertas.push({
      id: `baja-${record.id}`,
      label: record.nombre,
      sublabel: isOverdue
        ? `⚠️ Último día: ${record.lastDay} — ${record.materialCountAtBaja} materiales pendientes`
        : `${record.materialCountAtBaja} ${record.materialCountAtBaja === 1 ? 'material' : 'materiales'} pendiente${record.materialCountAtBaja === 1 ? '' : 's'}`,
      motivo: isOverdue ? 'Baja vencida — acción urgente' : 'Baja en proceso',
      tipo: isOverdue ? 'baja_escalada' : 'baja_pendiente',
      linkTo: `/people/${record.id}`,
    });
  }

  // Sort: escalated alerts first
  alertas.sort((a, b) => {
    const priority = { baja_escalada: 0, perdido: 1, reparacion: 2, baja_pendiente: 3, linea: 4, confirmacion_vencida: 5 };
    return (priority[a.tipo] ?? 99) - (priority[b.tipo] ?? 99);
  });

  return {
    total,
    enUso,
    utilizacionPct,
    disponible,
    sinMovimiento90,
    perdidos,
    enReparacion,
    personasActivas,
    personasConMateriales,
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
