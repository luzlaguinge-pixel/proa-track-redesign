import { type HistorialEvento, type Material } from '../List/types';
import { getMaterialById, updateMaterial } from '../store';

import { type Person } from './types';

export const getMaterial = async (id: string): Promise<Material | null> => {
  return getMaterialById(id);
};

const today = () => new Date().toISOString().slice(0, 10);

const newEvent = (
  event: Omit<HistorialEvento, 'id' | 'fecha'>,
): HistorialEvento => ({
  id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  fecha: new Date().toISOString(),
  ...event,
});

export type AssignInput = {
  materialId: string;
  person: Person;
  comodato: boolean;
  observacion: string;
  autor: string;
};

export const assignMaterial = async (
  input: AssignInput,
): Promise<Material | null> => {
  const { materialId, person, comodato, observacion, autor } = input;
  return updateMaterial(materialId, current => {
    const isReassign = !!current.responsableNombre;
    const prevName = current.responsableNombre;
    const titulo = isReassign
      ? `Reasignado a ${person.nombre}`
      : `Asignado a ${person.nombre}`;
    const descParts: string[] = [];
    if (isReassign && prevName) descParts.push(`Anterior: ${prevName}`);
    descParts.push(`Comodato: ${comodato ? 'firmado' : 'sin firmar'}`);
    if (observacion.trim()) descParts.push(observacion.trim());
    return {
      ...current,
      responsableNombre: person.nombre,
      responsableDni: person.dni || null,
      responsableTelefono: person.telefono || null,
      comodatoFirmado: comodato,
      estado: 'en_uso',
      fechaActualizacion: today(),
      historial: [
        newEvent({
          tipo: isReassign ? 'reasignacion' : 'asignacion',
          autor,
          titulo,
          descripcion: descParts.join(' · '),
        }),
        ...current.historial,
      ],
    };
  });
};

export type ReportInput = {
  materialId: string;
  kind: 'perdido' | 'dañado';
  motivo: string;
  autor: string;
};

export const reportMaterial = async (
  input: ReportInput,
): Promise<Material | null> => {
  const { materialId, kind, motivo, autor } = input;
  return updateMaterial(materialId, current => {
    const titulo =
      kind === 'perdido' ? 'Marcado como perdido' : 'Marcado como dañado';
    const next: Material = {
      ...current,
      fechaActualizacion: today(),
      historial: [
        newEvent({
          tipo: kind === 'perdido' ? 'marcado_perdido' : 'marcado_dañado',
          autor,
          titulo,
          descripcion: motivo.trim(),
        }),
        ...current.historial,
      ],
    };
    if (kind === 'perdido') next.estado = 'perdida';
    if (kind === 'dañado') next.estadoFisico = 'dañado';
    return next;
  });
};

export type SendToRepairInput = {
  materialId: string;
  taller: string;
  autor: string;
};

export const sendToRepair = async (
  input: SendToRepairInput,
): Promise<Material | null> => {
  const { materialId, taller, autor } = input;
  return updateMaterial(materialId, current => ({
    ...current,
    estado: 'en_reparacion',
    fechaActualizacion: today(),
    historial: [
      newEvent({
        tipo: 'enviado_reparacion',
        autor,
        titulo: 'Enviado a reparación',
        descripcion: taller.trim() || undefined,
      }),
      ...current.historial,
    ],
  }));
};

export type MarkRecoveredInput = {
  materialId: string;
  comentario: string;
  quedaOk: boolean;
  autor: string;
};

export const markRecovered = async (
  input: MarkRecoveredInput,
): Promise<Material | null> => {
  const { materialId, comentario, quedaOk, autor } = input;
  return updateMaterial(materialId, current => {
    const comeFrom =
      current.estado === 'perdida'
        ? 'perdida'
        : current.estado === 'en_reparacion'
          ? 'reparacion'
          : 'otro';
    const wasRepaired = comeFrom === 'reparacion';
    const titulo =
      comeFrom === 'perdida'
        ? 'Material recuperado'
        : wasRepaired
          ? 'Material recuperado de reparación'
          : 'Material recuperado';
    const descParts: string[] = [];
    if (wasRepaired) {
      descParts.push(quedaOk ? 'Quedó en buen estado' : 'Sigue con daños');
    }
    if (comentario.trim()) descParts.push(comentario.trim());
    return {
      ...current,
      estado: current.responsableNombre ? 'en_uso' : 'sin_uso',
      estadoFisico: wasRepaired && quedaOk ? 'ok' : current.estadoFisico,
      fechaActualizacion: today(),
      historial: [
        newEvent({
          tipo: 'recuperado',
          autor,
          titulo,
          descripcion: descParts.length ? descParts.join(' · ') : undefined,
        }),
        ...current.historial,
      ],
    };
  });
};

export type ConfirmInput = {
  materialId: string;
  kind: 'devolucion' | 'notificar';
  autor: string;
};

export const requestConfirmation = async (
  input: ConfirmInput,
): Promise<Material | null> => {
  const { materialId, kind, autor } = input;
  return updateMaterial(materialId, current => ({
    ...current,
    historial: [
      newEvent({
        tipo: kind === 'devolucion' ? 'solicitud_devolucion' : 'notificacion',
        autor,
        titulo:
          kind === 'devolucion'
            ? 'Devolución solicitada'
            : 'Responsable notificado',
        descripcion: current.responsableNombre
          ? `Enviado a ${current.responsableNombre}`
          : undefined,
      }),
      ...current.historial,
    ],
  }));
};

export type ReturnMaterialInput = {
  materialId: string;
  comentario: string;
  autor: string;
};

export const returnMaterial = async (
  input: ReturnMaterialInput,
): Promise<Material | null> => {
  const { materialId, comentario, autor } = input;
  return updateMaterial(materialId, current => ({
    ...current,
    responsableNombre: null,
    responsableDni: null,
    responsableTelefono: null,
    comodatoFirmado: false,
    estado: 'sin_uso',
    fechaActualizacion: today(),
    historial: [
      newEvent({
        tipo: 'devolucion',
        autor,
        titulo: 'Material devuelto',
        descripcion: comentario.trim() || undefined,
      }),
      ...current.historial,
    ],
  }));
};

// ─── Confirmación de tenencia ─────────────────────────────────────────────────

export type ConfirmTenenciaInput = {
  materialId: string;
  responsableNombre: string;
  nota: string;
  /** Compressed base64 photo from the navegante's device camera. */
  fotoBase64: string | null;
  autor: string;
};

/**
 * Saves a tenencia confirmation as a historial event on the material.
 * This persists to Supabase (cross-device) instead of an ephemeral in-memory store.
 */
export const confirmTenencia = async (
  input: ConfirmTenenciaInput,
): Promise<Material | null> => {
  const { materialId, nota, fotoBase64, autor } = input;
  return updateMaterial(materialId, current => ({
    ...current,
    historial: [
      newEvent({
        tipo: 'confirmacion_tenencia',
        autor,
        titulo: 'Tenencia confirmada',
        descripcion: nota.trim() || undefined,
        fotoBase64: fotoBase64 ?? null,
      }),
      ...current.historial,
    ],
  }));
};
