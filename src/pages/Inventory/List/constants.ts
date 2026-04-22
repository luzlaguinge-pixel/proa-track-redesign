import { type PillsProps } from '@material-hu/components/design-system/Pills/types';

import {
  type MaterialDueño,
  type MaterialEstado,
  type MaterialTipo,
} from './types';

export const TIPO_LABEL: Record<MaterialTipo, string> = {
  pechera: 'Pechera',
  filmina: 'Filmina',
  tira_credencial: 'Tira credencial',
  gorra: 'Gorra',
  remera: 'Remera',
  celular: 'Celular',
  tablet: 'Tablet',
  cargador: 'Cargador',
  funda: 'Funda',
  banner: 'Banner',
  otro: 'Otro',
};

export const ESTADO_CONFIG: Record<
  MaterialEstado,
  { label: string; type: PillsProps['type'] }
> = {
  en_uso: { label: 'EN USO', type: 'success' },
  sin_uso: { label: 'SIN USO', type: 'neutral' },
  perdida: { label: 'PERDIDA', type: 'error' },
  en_reparacion: { label: 'EN REPARACIÓN', type: 'warning' },
};

export const DUEÑO_LABEL: Record<MaterialDueño, string> = {
  proa: 'Proa',
  cliente: 'Cliente',
};

export const PAGE_LIMIT_OPTIONS = [10, 25, 50];
