import { getMaterialById, updateMaterial } from '../store';

import type { HistorialEvento, Material } from '../List/types';
import type { Person } from './types';

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
