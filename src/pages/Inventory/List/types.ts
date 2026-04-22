export type MaterialTipo =
  | 'pechera'
  | 'filmina'
  | 'tira_credencial'
  | 'gorra'
  | 'remera'
  | 'celular'
  | 'tablet'
  | 'cargador'
  | 'funda'
  | 'banner'
  | 'otro';

export type MaterialEstado = 'en_uso' | 'sin_uso' | 'perdida';

export type MaterialEstadoFisico = 'ok' | 'dañado';

export type MaterialDueño = 'proa' | 'cliente';

export type MaterialPais = 'AR' | 'UY' | 'GT';

export type HistorialEventoTipo =
  | 'asignacion'
  | 'reasignacion'
  | 'devolucion'
  | 'solicitud_devolucion'
  | 'notificacion'
  | 'marcado_perdido'
  | 'marcado_dañado';

export type HistorialEvento = {
  id: string;
  tipo: HistorialEventoTipo;
  fecha: string;
  autor: string;
  titulo: string;
  descripcion?: string;
};

export type Material = {
  id: string;
  tipo: MaterialTipo;
  detalle: string;
  estado: MaterialEstado;
  estadoFisico: MaterialEstadoFisico;
  osc: string;
  dueño: MaterialDueño;
  cantidad: number;
  plaza: string;
  pais: MaterialPais;
  responsableNombre: string | null;
  responsableDni: string | null;
  responsableTelefono: string | null;
  comodatoFirmado: boolean;
  lineaTelefonica: string | null;
  observaciones: string | null;
  fechaActualizacion: string;
  historial: HistorialEvento[];
};
