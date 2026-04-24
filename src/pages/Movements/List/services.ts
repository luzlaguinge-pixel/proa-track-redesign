import { TIPO_LABEL } from '../../Inventory/List/constants';
import { getAllMaterials } from '../../Inventory/store';

import { type MovimientoGlobal } from './types';

/** Aggregates all historial events from every material into a flat, date-sorted list. */
export const getAllMovements = async (): Promise<MovimientoGlobal[]> => {
  const materials = await getAllMaterials();
  const movements: MovimientoGlobal[] = [];

  for (const m of materials) {
    const label = `${TIPO_LABEL[m.tipo]}${m.detalle ? ` · ${m.detalle}` : ''}`;
    for (const event of m.historial) {
      movements.push({
        id: `${m.id}_${event.id}`,
        tipo: event.tipo,
        titulo: event.titulo,
        autor: event.autor,
        fecha: event.fecha,
        descripcion: event.descripcion,
        materialLabel: label,
        materialId: m.id,
        pais: m.pais,
        responsableNombre: m.responsableNombre,
      });
    }
  }

  return movements.sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
  );
};

/** Generates and triggers download of a CSV file from the provided movements list. */
export const exportMovementsToCSV = (movements: MovimientoGlobal[]): void => {
  const headers = [
    'Fecha',
    'Tipo',
    'Título',
    'Autor',
    'Material',
    'País',
    'Descripción',
  ];
  const rows = movements.map(m => [
    new Date(m.fecha).toLocaleString('es-AR'),
    m.tipo,
    m.titulo,
    m.autor,
    m.materialLabel,
    m.pais,
    m.descripcion ?? '',
  ]);
  const csv = [headers, ...rows]
    .map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','),
    )
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `movimientos_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
