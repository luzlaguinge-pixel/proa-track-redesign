import { getAllMaterials } from '../../Inventory/store';
import { type Material } from '../../Inventory/List/types';
import {
  createConfirmacion,
  getAllConfirmaciones,
  getConfirmacionesByMaterial,
  getConfirmacionesByResponsable,
  type Confirmacion,
} from '../store';

export type MaterialConEstadoConfirmacion = Material & {
  confirmadaEsteMes: boolean;
  ultimaConfirmacion: Confirmacion | null;
};

const esMismoMes = (fecha: string): boolean => {
  const d = new Date(fecha);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

export const getMaterialesParaConfirmar = (
  responsableNombre: string,
): MaterialConEstadoConfirmacion[] => {
  const materials = getAllMaterials().filter(
    m => m.responsableNombre === responsableNombre && m.estado === 'en_uso',
  );
  return materials.map(m => {
    const confirmaciones = getConfirmacionesByMaterial(m.id)
      .filter(c => c.responsableNombre === responsableNombre)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    const ultima = confirmaciones[0] ?? null;
    return {
      ...m,
      confirmadaEsteMes: ultima ? esMismoMes(ultima.fecha) : false,
      ultimaConfirmacion: ultima,
    };
  });
};

export type ConfirmarInput = {
  materialId: string;
  responsableNombre: string;
  nota: string;
  fotoBase64: string | null;
};

export const confirmarTenencia = async (input: ConfirmarInput): Promise<Confirmacion> => {
  return createConfirmacion({
    materialId: input.materialId,
    responsableNombre: input.responsableNombre,
    fecha: new Date().toISOString(),
    nota: input.nota,
    fotoBase64: input.fotoBase64,
  });
};

export type ConfirmacionConMaterial = Confirmacion & {
  materialLabel: string;
  responsableNombre: string;
};

export const getConfirmacionesEquipo = (
  teamNombres: string[],
): ConfirmacionConMaterial[] => {
  const materials = getAllMaterials();
  const all = getAllConfirmaciones();
  return all
    .filter(c => teamNombres.includes(c.responsableNombre))
    .map(c => {
      const m = materials.find(mat => mat.id === c.materialId);
      return {
        ...c,
        materialLabel: m ? `${m.tipo} · ${m.detalle || '—'}` : c.materialId,
      };
    })
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
};
