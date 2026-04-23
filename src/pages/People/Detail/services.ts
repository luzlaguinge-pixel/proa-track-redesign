import db from '../../../../mock/db.json';
import { TIPO_LABEL } from '../../Inventory/List/constants';
import {
  type HistorialEvento,
  type Material,
} from '../../Inventory/List/types';
import { getAllMaterials } from '../../Inventory/store';

import { getPersonOverride, updatePersonOverride } from '../store';
import { type PersonDetail } from './types';

type RawPerson = {
  id: string;
  nombre: string;
  dni: string;
  telefono: string;
  email: string;
  puesto: string;
  pais: 'AR' | 'GT' | 'UY';
  jefeDirectoNombre: string | null;
};
const rawPersons = (db as { persons: RawPerson[] }).persons;

export const getPersonById = async (
  id: string,
): Promise<PersonDetail | null> => {
  const found = rawPersons.find(p => p.id === id);
  if (!found) return null;
  const override = getPersonOverride(id);
  return { ...found, ...override };
};

export const updatePersonContact = async (
  id: string,
  fields: { dni?: string; telefono?: string },
): Promise<void> => {
  updatePersonOverride(id, fields);
};

export const getPersonMaterials = async (
  nombre: string,
): Promise<Material[]> => {
  return getAllMaterials().filter(m => m.responsableNombre === nombre);
};

export type PersonHistorialEvento = HistorialEvento & {
  materialLabel: string;
  materialId: string;
};

export const getPersonHistory = async (
  nombre: string,
): Promise<PersonHistorialEvento[]> => {
  const materials = getAllMaterials();
  const events: PersonHistorialEvento[] = [];

  for (const material of materials) {
    const everAssigned =
      material.responsableNombre === nombre ||
      material.historial.some(
        e =>
          (e.tipo === 'asignacion' || e.tipo === 'reasignacion') &&
          e.titulo.includes(nombre),
      );

    if (everAssigned) {
      const label = `${TIPO_LABEL[material.tipo]}${material.detalle ? ` · ${material.detalle}` : ''}`;
      for (const event of material.historial) {
        events.push({
          ...event,
          materialLabel: label,
          materialId: material.id,
        });
      }
    }
  }

  return events.sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
  );
};
