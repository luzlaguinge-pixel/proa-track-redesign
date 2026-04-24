import { getAllConfirmaciones } from '../../Confirmation/store';
import { getAllMaterials } from '../../Inventory/store';
import { getAllSolicitudes } from '../../Solicitudes/store';
import { isRead, markRead } from '../store';

export type Notificacion = {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  leida: boolean;
  navigationPath?: string;
};

export type NavegantePendiente = {
  nombre: string;
  materialesPendientes: number;
};

const esMismoMes = (fecha: string): boolean => {
  const d = new Date(fecha);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
};

const esUltimaSemana = (fecha: string): boolean => {
  const d = new Date(fecha);
  const now = new Date();
  return now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
};

export const getNotificacionesCaptador = (nombre: string): Notificacion[] => {
  const notifs: Notificacion[] = [];
  const materials = getAllMaterials().filter(
    m => m.responsableNombre === nombre && m.estado === 'en_uso',
  );

  if (materials.length > 0) {
    const confirmados = new Set(
      getAllConfirmaciones()
        .filter(c => c.responsableNombre === nombre && esMismoMes(c.fecha))
        .map(c => c.materialId),
    );
    const pendientes = materials.filter(m => !confirmados.has(m.id));
    if (pendientes.length > 0) {
      const id = `confirm-pendiente-${nombre}`;
      notifs.push({
        id,
        titulo: 'Confirmación mensual pendiente',
        descripcion: `Tenés ${pendientes.length} ${pendientes.length === 1 ? 'material' : 'materiales'} sin confirmar este mes.`,
        fecha: new Date().toISOString(),
        severity: 'warning',
        leida: isRead(id),
        navigationPath: `/my-materials`,
      });
    }
  }

  const solicitudes = getAllSolicitudes().filter(
    s => s.solicitanteNombre === nombre,
  );
  for (const s of solicitudes) {
    if (
      s.estado === 'aprobada' &&
      s.fechaResolucion &&
      esUltimaSemana(s.fechaResolucion)
    ) {
      const id = `sol-aprobada-${s.id}`;
      notifs.push({
        id,
        titulo: 'Movimiento aprobado',
        descripcion: `Tu solicitud de movimiento de ${s.materialLabel} a ${s.destinatarioNombre} fue aprobada.`,
        fecha: s.fechaResolucion,
        severity: 'success',
        leida: isRead(id),
        navigationPath: `/my-materials`,
      });
    }
    if (
      s.estado === 'rechazada' &&
      s.fechaResolucion &&
      esUltimaSemana(s.fechaResolucion)
    ) {
      const id = `sol-rechazada-${s.id}`;
      notifs.push({
        id,
        titulo: 'Movimiento rechazado',
        descripcion: `Tu solicitud de movimiento de ${s.materialLabel} a ${s.destinatarioNombre} fue rechazada.`,
        fecha: s.fechaResolucion,
        severity: 'error',
        leida: isRead(id),
        navigationPath: `/my-materials`,
      });
    }
  }

  return notifs.sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
  );
};

export const getNotificacionesLiderAdmin = (
  teamNombres: string[],
): Notificacion[] => {
  const notifs: Notificacion[] = [];

  const pendientes = getAllSolicitudes().filter(
    s => s.estado === 'pendiente' && teamNombres.includes(s.solicitanteNombre),
  );
  if (pendientes.length > 0) {
    const id = 'sol-pendientes-aprobacion';
    notifs.push({
      id,
      titulo: 'Solicitudes pendientes de aprobación',
      descripcion: `Hay ${pendientes.length} ${pendientes.length === 1 ? 'solicitud' : 'solicitudes'} de movimiento esperando tu aprobación.`,
      fecha: pendientes[0].fecha,
      severity: 'warning',
      leida: isRead(id),
      navigationPath: `/solicitudes`,
    });
  }

  const materials = getAllMaterials().filter(
    m =>
      m.estado === 'en_uso' &&
      m.responsableNombre &&
      teamNombres.includes(m.responsableNombre),
  );
  const confirmados = new Set(
    getAllConfirmaciones()
      .filter(c => esMismoMes(c.fecha))
      .map(c => c.materialId),
  );
  const sinConfirmar = new Set(
    materials.filter(m => !confirmados.has(m.id)).map(m => m.responsableNombre),
  );
  if (sinConfirmar.size > 0) {
    const id = 'equipo-sin-confirmar';
    notifs.push({
      id,
      titulo: 'Navegantes sin confirmar este mes',
      descripcion: `${sinConfirmar.size} ${sinConfirmar.size === 1 ? 'persona del equipo no confirmó' : 'personas del equipo no confirmaron'} la tenencia de sus materiales este mes.`,
      fecha: new Date().toISOString(),
      severity: 'info',
      leida: isRead(id),
      navigationPath: `/team-confirmations`,
    });
  }

  const enRiesgo = getAllMaterials().filter(
    m => m.estado === 'perdida' || m.estado === 'en_reparacion',
  );
  if (enRiesgo.length > 0) {
    const id = 'materiales-en-riesgo';
    notifs.push({
      id,
      titulo: 'Materiales en estado crítico',
      descripcion: `${enRiesgo.length} ${enRiesgo.length === 1 ? 'material' : 'materiales'} en estado perdido o en reparación.`,
      fecha: new Date().toISOString(),
      severity: 'error',
      leida: isRead(id),
      navigationPath: `/inventory`,
    });
  }

  return notifs.sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
  );
};

export const getNavegantesConConfirmacionesPendientes =
  (): NavegantePendiente[] => {
    const materials = getAllMaterials().filter(
      m => m.estado === 'en_uso' && m.responsableNombre,
    );
    const confirmados = new Set(
      getAllConfirmaciones()
        .filter(c => esMismoMes(c.fecha))
        .map(c => c.materialId),
    );

    const navegantesPendientes = new Map<string, number>();

    for (const material of materials) {
      if (material.responsableNombre && !confirmados.has(material.id)) {
        navegantesPendientes.set(
          material.responsableNombre,
          (navegantesPendientes.get(material.responsableNombre) ?? 0) + 1,
        );
      }
    }

    return Array.from(navegantesPendientes, ([nombre, count]) => ({
      nombre,
      materialesPendientes: count,
    }));
  };

export const sendBulkReminderNotifications = (): Notificacion[] => {
  const navegantes = getNavegantesConConfirmacionesPendientes();
  const notificaciones: Notificacion[] = [];

  for (const nav of navegantes) {
    const id = `reminder-${nav.nombre}-${Date.now()}`;
    notificaciones.push({
      id,
      titulo: 'Recordatorio: Confirmación pendiente',
      descripcion: `Recordatorio: Tenés ${nav.materialesPendientes} ${nav.materialesPendientes === 1 ? 'material' : 'materiales'} sin confirmar este mes.`,
      fecha: new Date().toISOString(),
      severity: 'warning',
      leida: false,
      navigationPath: '/my-materials',
    });
  }

  return notificaciones;
};
