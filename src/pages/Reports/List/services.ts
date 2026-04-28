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

export type ReportFilters = {
  dateStart?: string;
  dateEnd?: string;
  estado?: string;
  ubicacion?: string;
  tipoActividad?: string;
  equipo?: string;
};

const esMismoMes = (fecha: string): boolean => {
  const d = new Date(fecha);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
};

const isWithinDateRange = (
  fecha: string,
  start?: string,
  end?: string,
): boolean => {
  if (!start && !end) return true;
  const d = new Date(fecha);
  if (start && d < new Date(start)) return false;
  if (end && d > new Date(end)) return false;
  return true;
};

export const getMaterialStats = async (filters?: ReportFilters): Promise<MaterialStats> => {
  let materials = await getAllMaterials();

  if (filters?.ubicacion) {
    materials = materials.filter(m => m.plaza === filters.ubicacion);
  }
  if (filters?.estado) {
    materials = materials.filter(m => m.estado === filters.estado);
  }

  return {
    total: materials.length,
    enUso: materials.filter(m => m.estado === 'en_uso').length,
    sinUso: materials.filter(m => m.estado === 'sin_uso').length,
    perdida: materials.filter(m => m.estado === 'perdida').length,
    enReparacion: materials.filter(m => m.estado === 'en_reparacion').length,
  };
};

export const getConfirmacionStats = async (
  filters?: ReportFilters,
): Promise<ConfirmacionStats> => {
  let enUso = (await getAllMaterials()).filter(m => m.estado === 'en_uso');

  if (filters?.ubicacion) {
    enUso = enUso.filter(m => m.plaza === filters.ubicacion);
  }

  let confirmaciones = getAllConfirmaciones().filter(c => esMismoMes(c.fecha));

  if (filters?.dateStart || filters?.dateEnd) {
    confirmaciones = confirmaciones.filter(c =>
      isWithinDateRange(c.fecha, filters.dateStart, filters.dateEnd),
    );
  }

  const confirmadosIds = new Set(confirmaciones.map(c => c.materialId));
  const confirmados = enUso.filter(m => confirmadosIds.has(m.id)).length;
  const total = enUso.length;
  return {
    total,
    confirmados,
    pendientes: total - confirmados,
    porcentaje: total > 0 ? Math.round((confirmados / total) * 100) : 0,
  };
};

export const getSolicitudStats = async (filters?: ReportFilters): Promise<SolicitudStats> => {
  let s = await getAllSolicitudes();

  if (filters?.dateStart || filters?.dateEnd) {
    s = s.filter(x =>
      isWithinDateRange(x.fecha, filters.dateStart, filters.dateEnd),
    );
  }

  return {
    pendientes: s.filter(x => x.estado === 'pendiente').length,
    aprobadas: s.filter(x => x.estado === 'aprobada').length,
    rechazadas: s.filter(x => x.estado === 'rechazada').length,
  };
};

export const getMaterialsByOsc = async (filters?: ReportFilters): Promise<BreakdownItem[]> => {
  let materials = (await getAllMaterials()).filter(m => m.estado === 'en_uso');

  if (filters?.ubicacion) {
    materials = materials.filter(m => m.plaza === filters.ubicacion);
  }

  const byOsc: Record<string, number> = {};
  for (const m of materials) {
    const key = m.osc || 'Sin OSC';
    byOsc[key] = (byOsc[key] ?? 0) + 1;
  }
  return Object.entries(byOsc)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

export const getMaterialsByPlaza = async (
  filters?: ReportFilters,
): Promise<BreakdownItem[]> => {
  let materials = (await getAllMaterials()).filter(m => m.estado === 'en_uso');

  if (filters?.estado) {
    materials = materials.filter(m => m.estado === filters.estado);
  }

  const byPlaza: Record<string, number> = {};
  for (const m of materials) {
    const key = m.plaza || 'Sin plaza';
    byPlaza[key] = (byPlaza[key] ?? 0) + 1;
  }
  return Object.entries(byPlaza)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};
