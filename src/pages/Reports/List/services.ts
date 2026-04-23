import { getAllConfirmaciones } from '../../Confirmation/store';
import { getAllMaterials } from '../../Inventory/store';
import { getAllSolicitudes } from '../../Solicitudes/store';

export type MaterialStats = {
  total: number;
  enUso: number;
  sinUso: number;
  perdida: number;
  enReparacion: number;
};

export type ConfirmacionStats = {
  total: number;
  confirmados: number;
  pendientes: number;
  porcentaje: number;
};

export type SolicitudStats = {
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
};

export type BreakdownItem = { label: string; count: number };

const esMismoMes = (fecha: string): boolean => {
  const d = new Date(fecha);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

export const getMaterialStats = (): MaterialStats => {
  const materials = getAllMaterials();
  return {
    total: materials.length,
    enUso: materials.filter(m => m.estado === 'en_uso').length,
    sinUso: materials.filter(m => m.estado === 'sin_uso').length,
    perdida: materials.filter(m => m.estado === 'perdida').length,
    enReparacion: materials.filter(m => m.estado === 'en_reparacion').length,
  };
};

export const getConfirmacionStats = (): ConfirmacionStats => {
  const enUso = getAllMaterials().filter(m => m.estado === 'en_uso');
  const confirmadosIds = new Set(
    getAllConfirmaciones()
      .filter(c => esMismoMes(c.fecha))
      .map(c => c.materialId),
  );
  const confirmados = enUso.filter(m => confirmadosIds.has(m.id)).length;
  const total = enUso.length;
  return {
    total,
    confirmados,
    pendientes: total - confirmados,
    porcentaje: total > 0 ? Math.round((confirmados / total) * 100) : 0,
  };
};

export const getSolicitudStats = (): SolicitudStats => {
  const s = getAllSolicitudes();
  return {
    pendientes: s.filter(x => x.estado === 'pendiente').length,
    aprobadas: s.filter(x => x.estado === 'aprobada').length,
    rechazadas: s.filter(x => x.estado === 'rechazada').length,
  };
};

export const getMaterialsByOsc = (): BreakdownItem[] => {
  const byOsc: Record<string, number> = {};
  for (const m of getAllMaterials().filter(m => m.estado === 'en_uso')) {
    const key = m.osc || 'Sin OSC';
    byOsc[key] = (byOsc[key] ?? 0) + 1;
  }
  return Object.entries(byOsc)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

export const getMaterialsByPlaza = (): BreakdownItem[] => {
  const byPlaza: Record<string, number> = {};
  for (const m of getAllMaterials().filter(m => m.estado === 'en_uso')) {
    const key = m.plaza || 'Sin plaza';
    byPlaza[key] = (byPlaza[key] ?? 0) + 1;
  }
  return Object.entries(byPlaza)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};
