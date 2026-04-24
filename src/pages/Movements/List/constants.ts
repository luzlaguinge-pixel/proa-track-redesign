import { type HistorialEventoTipo } from '../../Inventory/List/types';

export const EVENTO_LABEL: Record<HistorialEventoTipo, string> = {
  asignacion: 'Asignación',
  reasignacion: 'Reasignación',
  devolucion: 'Devolución',
  solicitud_devolucion: 'Sol. devolución',
  notificacion: 'Notificación',
  marcado_perdido: 'Perdido',
  marcado_dañado: 'Dañado',
  enviado_reparacion: 'En reparación',
  recuperado: 'Recuperado',
  confirmacion_tenencia: 'Confirmación',
};

type PillType = 'success' | 'warning' | 'error' | 'neutral' | 'info';

export const EVENTO_PILL: Record<HistorialEventoTipo, PillType> = {
  asignacion: 'success',
  reasignacion: 'info',
  devolucion: 'success',
  solicitud_devolucion: 'warning',
  notificacion: 'warning',
  marcado_perdido: 'error',
  marcado_dañado: 'error',
  enviado_reparacion: 'warning',
  recuperado: 'success',
  confirmacion_tenencia: 'success',
};

export const PAIS_LABEL: Record<string, string> = {
  todos: 'Todos',
  AR: 'Argentina',
  UY: 'Uruguay',
  GT: 'Guatemala',
};
