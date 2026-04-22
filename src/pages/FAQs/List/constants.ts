export type FAQ = {
  id: string;
  category: 'General' | 'Inventario' | 'Equipo' | 'Reportes' | 'Solicitudes' | 'Confirmaciones';
  question: string;
  answer: string;
  order: number;
  forProfiles?: ('admin' | 'lider' | 'navegante')[];
};

export const FAQS: FAQ[] = [
  // ─── General ───────────────────────────────────────────────────────────────
  {
    id: 'faq-general-1',
    category: 'General',
    question: '¿Qué es Proa Track?',
    answer: 'Proa Track es un sistema de gestión de materiales que te permite ver, confirmar y solicitar movimientos de los materiales bajo tu responsabilidad. El sistema mantiene un registro centralizado de todos los recursos y su estado.',
    order: 1,
    forProfiles: ['navegante', 'admin', 'lider'],
  },
  {
    id: 'faq-general-2',
    category: 'General',
    question: '¿Cómo accedo a Proa Track?',
    answer: 'Puedes acceder a Proa Track desde cualquier navegador web usando tus credenciales de usuario. Dirígete a la página de login e ingresa tu email y contraseña. Si olvidaste tu contraseña, utiliza la opción "Olvidé mi contraseña" en la pantalla de login.',
    order: 2,
    forProfiles: ['navegante', 'admin', 'lider'],
  },
  {
    id: 'faq-general-3',
    category: 'General',
    question: '¿Qué puedo hacer en Proa Track?',
    answer: 'Como navegante, puedes ver todos tus materiales asignados en "Mis materiales", confirmar su estado mensualmente, solicitar movimientos de materiales, y consultar las preguntas frecuentes para resolver tus dudas.',
    order: 3,
    forProfiles: ['navegante'],
  },
  {
    id: 'faq-general-4',
    category: 'General',
    question: '¿Cómo cambio mi contraseña?',
    answer: 'Haz clic en el avatar en la esquina superior derecha y selecciona "Cambiar contraseña". Sigue los pasos para ingresar tu contraseña actual y la nueva. La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.',
    order: 4,
    forProfiles: ['navegante', 'admin', 'lider'],
  },

  // ─── Inventario ────────────────────────────────────────────────────────────
  {
    id: 'faq-inventory-1',
    category: 'Inventario',
    question: '¿Cómo agrego un nuevo material al inventario?',
    answer: 'En la sección de Inventario, haz clic en el botón "Nuevo material". Completa los campos requeridos como nombre, descripción, cantidad inicial, ubicación y estado. Luego haz clic en "Guardar" para agregar el material al sistema.',
    order: 1,
    forProfiles: ['admin', 'lider'],
  },
  {
    id: 'faq-inventory-2',
    category: 'Inventario',
    question: '¿Qué diferencia hay entre "En uso" y "Disponible"?',
    answer: '"En uso" indica que el material está siendo utilizado actualmente en operaciones. "Disponible" significa que el material está en stock pero no está siendo utilizado en este momento y puede ser asignado a nuevas operaciones.',
    order: 2,
    forProfiles: ['admin', 'lider'],
  },
  {
    id: 'faq-inventory-3',
    category: 'Inventario',
    question: '¿Cómo registro un material como perdido?',
    answer: 'En la tarjeta del material, selecciona el estado "Perdido" y proporciona una descripción de las circunstancias. El material se marcará como no disponible y aparecerá en los reportes de pérdidas para seguimiento administrativo.',
    order: 3,
    forProfiles: ['admin', 'lider'],
  },
  {
    id: 'faq-inventory-4',
    category: 'Inventario',
    question: '¿Cómo filtro materiales por ubicación o estado?',
    answer: 'En la vista de Inventario, utiliza los filtros en la parte superior. Puedes filtrar por estado (En uso, Disponible, En reparación, Perdido), ubicación, OSC, plaza o rango de fechas. Puedes combinar múltiples filtros para resultados más específicos.',
    order: 4,
    forProfiles: ['admin', 'lider'],
  },
  {
    id: 'faq-inventory-5',
    category: 'Inventario',
    question: '¿Qué son los materiales sin movimiento?',
    answer: 'Los materiales sin movimiento son aquellos que no han registrado cambios de estado o ubicación en un período determinado (generalmente 90 días). El sistema alerta sobre estos para evaluar si siguen siendo necesarios o si pueden ser retirados del inventario.',
    order: 5,
    forProfiles: ['admin', 'lider'],
  },

  // ─── Equipo ────────────────────────────────────────────────────────────────
  {
    id: 'faq-equipment-1',
    category: 'Equipo',
    question: '¿Cómo registro un equipo en mantenimiento?',
    answer: 'En la sección de Equipo, selecciona el equipo y cambia su estado a "En reparación". Proporciona detalles sobre el problema, la fecha estimada de entrega y notas adicionales. El equipo aparecerá separado en los reportes mientras está en mantenimiento.',
    order: 1,
    forProfiles: ['admin', 'lider'],
  },
  {
    id: 'faq-equipment-2',
    category: 'Equipo',
    question: '¿Cómo sé cuál es el historial de mantenimiento de un equipo?',
    answer: 'Haz clic en el equipo para abrir sus detalles. En la sección "Historial", verás todos los cambios de estado, mantenimientos registrados, fechas y comentarios asociados a ese equipo.',
    order: 2,
    forProfiles: ['admin', 'lider'],
  },
  {
    id: 'faq-equipment-3',
    category: 'Equipo',
    question: '¿Puedo ver qué equipos necesitan mantenimiento preventivo?',
    answer: 'Sí. En la sección de Reportes, hay una sección dedicada a equipos pendientes de mantenimiento preventivo basada en el calendario de servicio. Puedes filtrar por equipo tipo o ubicación.',
    order: 3,
    forProfiles: ['admin', 'lider'],
  },

  // ─── Reportes ──────────────────────────────────────────────────────────────
  {
    id: 'faq-reports-1',
    category: 'Reportes',
    question: '¿Qué información incluyen los reportes?',
    answer: 'Los reportes incluyen: resumen general de materiales, estado de confirmaciones mensuales, solicitudes de movimiento, desglose por OSC y plaza, materiales sin movimiento, equipos en reparación y alertas de inventario bajo.',
    order: 1,
    forProfiles: ['admin', 'lider'],
  },
  {
    id: 'faq-reports-2',
    category: 'Reportes',
    question: '¿Cómo descargo un reporte?',
    answer: 'En la sección de Reportes, haz clic en el botón "Descargar" (ícono de descarga) en la esquina superior derecha del reporte. Se descargará un archivo en formato Excel con toda la información.',
    order: 2,
    forProfiles: ['admin', 'lider'],
  },
  {
    id: 'faq-reports-3',
    category: 'Reportes',
    question: '¿Puedo personalizar los reportes?',
    answer: 'Sí. Puedes seleccionar el período de tiempo, filtrar por OSC, plaza o rango de fechas. También puedes elegir qué secciones incluir en el reporte antes de descargarlo.',
    order: 3,
    forProfiles: ['admin', 'lider'],
  },
  {
    id: 'faq-reports-4',
    category: 'Reportes',
    question: '¿Con qué frecuencia se actualizan los reportes?',
    answer: 'Los reportes se actualizan en tiempo real. Cualquier cambio en el inventario, estado de solicitudes o confirmaciones se refleja inmediatamente en los reportes y paneles de dashboard.',
    order: 4,
    forProfiles: ['admin', 'lider'],
  },

  // ─── Solicitudes ───────────────────────────────────────────────────────────
  {
    id: 'faq-requests-1',
    category: 'Solicitudes',
    question: '¿Cómo reporto un movimiento de material?',
    answer: 'En "Mis materiales", haz clic en el botón con los 3 puntos (⋮) al lado del material que moviste. Selecciona "Reportar movimiento" en el menú. Se abrirá un formulario donde debes indicar a quién le entregaste el material y el motivo. Haz clic en "Confirmar" para crear la solicitud. Un líder o administrador deberá aprobarla.',
    order: 1,
    forProfiles: ['navegante', 'admin', 'lider'],
  },
  {
    id: 'faq-requests-2',
    category: 'Solicitudes',
    question: '¿Cuánto tiempo tarda en aprobarse una solicitud de movimiento?',
    answer: 'El tiempo de aprobación depende del flujo de trabajo de tu organización. Generalmente, las solicitudes se revisan dentro de 24-48 horas. Puedes ver el estado de tus solicitudes en la sección "Solicitudes" del menú lateral, donde aparecen todas las solicitudes que has creado y su estado actual.',
    order: 2,
    forProfiles: ['navegante', 'admin', 'lider'],
  },
  {
    id: 'faq-requests-3',
    category: 'Solicitudes',
    question: '¿Qué hago si mi solicitud de movimiento es rechazada?',
    answer: 'Si una solicitud es rechazada, verás el estado actualizado en la sección "Solicitudes" con un comentario del administrador explicando el motivo. Puedes crear una nueva solicitud reportando el movimiento nuevamente desde "Mis materiales", o contactar a tu líder para discutir alternativas.',
    order: 3,
    forProfiles: ['navegante', 'admin', 'lider'],
  },
  {
    id: 'faq-requests-4',
    category: 'Solicitudes',
    question: '¿Cómo reporto un elemento perdido?',
    answer: 'Si un material bajo tu responsabilidad está perdido, ve a "Mis materiales" y haz clic en el botón con los 3 puntos (⋮) del material. Selecciona "Reportar pérdida" en el menú. Se abrirá un formulario donde debes describir las circunstancias de la pérdida. Haz clic en "Confirmar" para registrarlo. Un líder o administrador podrá ver el reporte en la sección de solicitudes.',
    order: 4,
    forProfiles: ['navegante', 'admin', 'lider'],
  },

  // ─── Confirmaciones ────────────────────────────────────────────────────────
  {
    id: 'faq-confirmations-1',
    category: 'Confirmaciones',
    question: '¿Qué es la confirmación de tenencia?',
    answer: 'La confirmación de tenencia es el proceso donde verificas que realmente tenés los materiales asignados a tu responsabilidad. Al confirmar, indicás que el material existe, está en buen estado, y que lo tenés en tu poder. Esto asegura que el inventario en el sistema coincida con la realidad física.',
    order: 1,
    forProfiles: ['navegante', 'admin', 'lider'],
  },
  {
    id: 'faq-confirmations-2',
    category: 'Confirmaciones',
    question: '¿Cuándo debo confirmar la tenencia de mis materiales?',
    answer: 'Puedes confirmar la tenencia en cualquier momento desde "Mis materiales". Sin embargo, tu organización puede requerir que lo hagas periódicamente (mensualmente, trimestralmente, etc.). Recibirás notificaciones si hay plazos que cumplir. Es importante completarla a tiempo para mantener registros precisos.',
    order: 2,
    forProfiles: ['navegante', 'admin', 'lider'],
  },
  {
    id: 'faq-confirmations-3',
    category: 'Confirmaciones',
    question: '¿Cómo confirmo que tengo un material?',
    answer: 'Ve a "Mis materiales" y localiza el material que querés confirmar. Haz clic en el botón con los 3 puntos (⋮) al lado del material y selecciona "Confirmar tenencia". Se abrirá un formulario donde puedes agregar una nota opcional y subir una foto del material. Haz clic en "Confirmar" para completar. Esto registra que verificaste el material y que lo tenés en tu poder.',
    order: 3,
    forProfiles: ['navegante', 'admin', 'lider'],
  },
  {
    id: 'faq-confirmations-4',
    category: 'Confirmaciones',
    question: '¿Qué pasa si no confirmo mis materiales a tiempo?',
    answer: 'Si no confirmas tus materiales en el período requerido, tu líder o administrador recibirá alertas de materiales pendientes de confirmación. Es importante completarla para mantener registros precisos del inventario y cumplir con los requisitos de auditoría de tu organización.',
    order: 4,
    forProfiles: ['navegante', 'admin', 'lider'],
  },
];

export const FAQ_CATEGORIES = ['General', 'Inventario', 'Equipo', 'Reportes', 'Solicitudes', 'Confirmaciones'] as const;
