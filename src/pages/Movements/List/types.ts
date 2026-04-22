import {
  type HistorialEventoTipo,
  type MaterialPais,
} from '../../Inventory/List/types';

export type MovimientoGlobal = {
  id: string;
  tipo: HistorialEventoTipo;
  titulo: string;
  autor: string;
  fecha: string;
  descripcion?: string;
  materialLabel: string;
  materialId: string;
  pais: MaterialPais;
  responsableNombre: string | null;
};

export type MovementsFilters = {
  search: string;
  tipo: HistorialEventoTipo | 'todos';
  pais: MaterialPais | 'todos';
};
