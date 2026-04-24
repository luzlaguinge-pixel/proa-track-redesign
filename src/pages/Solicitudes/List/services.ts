import db from '../../../../mock/db.json';

import { updateMaterial } from '../../Inventory/store';
import { getAllMaterials } from '../../Inventory/store';
import { getAllSolicitudes, resolveSolicitud, type Solicitud } from '../store';

type RawPerson = { id: string; nombre: string; dni: string; telefono: string };
const rawPersons = (db as { persons: RawPerson[] }).persons;

export type SolicitudConLabel = Solicitud & { materialLabel: string };

export const getSolicitudesPendientes = (
  teamNombres: string[],
): SolicitudConLabel[] => {
  const materials = getAllMaterials();
  return getAllSolicitudes()
    .filter(
      s =>
        s.estado === 'pendiente' && teamNombres.includes(s.solicitanteNombre),
    )
    .map(s => {
      const m = materials.find(mat => mat.id === s.materialId);
      return {
        ...s,
        materialLabel: m ? `${m.tipo} · ${m.detalle || '—'}` : s.materialLabel,
      };
    })
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
};

export const getAllSolicitudesAdmin = (): SolicitudConLabel[] => {
  const materials = getAllMaterials();
  return getAllSolicitudes()
    .map(s => {
      const m = materials.find(mat => mat.id === s.materialId);
      return {
        ...s,
        materialLabel: m ? `${m.tipo} · ${m.detalle || '—'}` : s.materialLabel,
      };
    })
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
};

export const aprobarSolicitud = (
  id: string,
  resolverPorNombre: string,
): Solicitud | null => {
  const solicitud = getAllSolicitudes().find(s => s.id === id);
  if (!solicitud) return null;

  const destinatario = rawPersons.find(
    p => p.nombre === solicitud.destinatarioNombre,
  );

  updateMaterial(solicitud.materialId, current => ({
    ...current,
    responsableNombre: solicitud.destinatarioNombre,
    responsableDni: destinatario?.dni || null,
    responsableTelefono: destinatario?.telefono || null,
    estado: 'en_uso' as const,
    historial: [
      {
        id: `evt_${Date.now()}`,
        tipo: 'reasignacion' as const,
        autor: resolverPorNombre,
        titulo: `Reasignado a ${solicitud.destinatarioNombre}`,
        descripcion: `Movimiento aprobado. Anterior: ${solicitud.solicitanteNombre}`,
        fecha: new Date().toISOString(),
      },
      ...current.historial,
    ],
  }));

  return resolveSolicitud(id, 'aprobada', resolverPorNombre);
};

export const rechazarSolicitud = (id: string, resolverPorNombre: string) =>
  resolveSolicitud(id, 'rechazada', resolverPorNombre);
