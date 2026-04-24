import { getAllMaterials } from '../../Inventory/store';
import { type Material } from '../../Inventory/List/types';
import { confirmTenencia } from '../../Inventory/Detail/services';
import type { Confirmacion } from '../store';

export type MaterialConEstadoConfirmacion = Material & {
  confirmadaEsteMes: boolean;
  ultimaConfirmacion: Confirmacion | null;
};

const esMismoMes = (fecha: string): boolean => {
  const d = new Date(fecha);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
};

/**
 * Returns all en_uso materials for a given responsable, enriched with
 * whether they've been confirmed this month. Reads from the material's historial
 * so data persists to Supabase and syncs across devices.
 */
export const getMaterialesParaConfirmar = async (
  responsableNombre: string,
): Promise<MaterialConEstadoConfirmacion[]> => {
  const materials = (await getAllMaterials()).filter(
    m => m.responsableNombre === responsableNombre && m.estado === 'en_uso',
  );

  return materials.map(m => {
    const events = m.historial
      .filter(
        h =>
          h.tipo === 'confirmacion_tenencia' &&
          h.autor === responsableNombre,
      )
      .sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      );

    const latest = events[0] ?? null;
    const confirmadaEsteMes = latest ? esMismoMes(latest.fecha) : false;

    const ultimaConfirmacion: Confirmacion | null = latest
      ? {
          id: latest.id,
          materialId: m.id,
          responsableNombre,
          fecha: latest.fecha,
          nota: latest.descripcion ?? '',
          fotoBase64: latest.fotoBase64 ?? null,
        }
      : null;

    return { ...m, confirmadaEsteMes, ultimaConfirmacion };
  });
};

export type ConfirmarInput = {
  materialId: string;
  responsableNombre: string;
  nota: string;
  fotoBase64: string | null;
};

/**
 * Confirms tenencia by writing a historial event to the material.
 * This persists to Supabase and is visible across all devices immediately.
 */
export const confirmarTenencia = async (
  input: ConfirmarInput,
): Promise<void> => {
  await confirmTenencia({
    materialId: input.materialId,
    responsableNombre: input.responsableNombre,
    nota: input.nota,
    fotoBase64: input.fotoBase64,
    autor: input.responsableNombre,
  });
};

export type ConfirmacionConMaterial = Confirmacion & {
  materialLabel: string;
};

/**
 * Returns all confirmacion_tenencia events for a set of team members.
 * Used by coordinador and admin views.
 */
export const getConfirmacionesEquipo = async (
  teamNombres: string[],
): Promise<ConfirmacionConMaterial[]> => {
  const materials = await getAllMaterials();
  const result: ConfirmacionConMaterial[] = [];

  for (const m of materials) {
    const events = m.historial.filter(
      h =>
        h.tipo === 'confirmacion_tenencia' &&
        teamNombres.includes(h.autor),
    );
    for (const e of events) {
      result.push({
        id: e.id,
        materialId: m.id,
        responsableNombre: e.autor,
        fecha: e.fecha,
        nota: e.descripcion ?? '',
        fotoBase64: e.fotoBase64 ?? null,
        materialLabel: `${m.tipo} · ${m.detalle || '—'}`,
      });
    }
  }

  return result.sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
  );
};

/**
 * Returns all confirmacion_tenencia events across all materials.
 * Used by the admin confirmations view.
 */
export const getAllConfirmacionesFromHistorial =
  async (): Promise<ConfirmacionConMaterial[]> => {
    const materials = await getAllMaterials();
    const result: ConfirmacionConMaterial[] = [];

    for (const m of materials) {
      const events = m.historial.filter(
        h => h.tipo === 'confirmacion_tenencia',
      );
      for (const e of events) {
        result.push({
          id: e.id,
          materialId: m.id,
          responsableNombre: e.autor,
          fecha: e.fecha,
          nota: e.descripcion ?? '',
          fotoBase64: e.fotoBase64 ?? null,
          materialLabel: `${m.tipo} · ${m.detalle || '—'}`,
        });
      }
    }

    return result.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );
  };
