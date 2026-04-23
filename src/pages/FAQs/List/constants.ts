export type FAQ = {
  id: string;
  category: 'General' | 'Inventario' | 'Equipo' | 'Reportes' | 'Solicitudes' | 'Confirmaciones';
  question: string;
  answer: string;
  order: number;
  forProfiles?: ('admin' | 'coordinador' | 'navegante')[];
};

export const FAQS: FAQ[] = [
  // ─── General ───────────────────────────────────────────────────────────────
  {
    id: 'faq-general-1',
    category: 'General',
    question: '¿Qué es Proa Track?',
    answer: 'Proa Track es un sistema de gestión de materiales que te permite ver, confirmar y solicitar movimientos de los materiales bajo tu responsabilidad. El sistema mantiene un registro centralizado de todos los recursos y su estado.',
    order: 1,
    forProfiles: ['navegante', 'admin', 'coordinador'],
  },
  {
    id: 'faq-general-2',
    category: 'General',
    question: '¿Cómo accedo a Proa Track?',
    answer: 'Puedes acceder a Proa Track desde cualquier navegador web usando tus credenciales de usuario. Dirígete a la página de login e ingresa tu email y contraseña.',
    order: 2,
    forProfiles: ['navegante', 'admin', 'coordinador'],
  },
  {
    id: 'faq-general-3',
    category: 'General',
    question: '¿Qué puedo hacer en Proa Track?',
    answer: 'Las opciones dependen de tu rol. Como navegante, puedes ver tus materiales asignados, confirmar su tenencia mensualmente, reportar movimientos, y consultar FAQs. Como coordinador/a regional, además puedes ver el equipo, inventario del equipo, y confirmar tenencias del equipo. Como admin, tienes acceso a todas las secciones incluyendo inventario, personas, catálogo, movimientos, solicitudes y reportes.',
    order: 3,
    forProfiles: ['navegante', 'admin', 'coordinador'],
  },
  {
    id: 'faq-general-4',
    category: 'General',
    question: '¿Cómo cierro mi sesión?',
    answer: 'Haz clic en el avatar en la esquina superior derecha y selecciona "Cerrar sesión". Esto te desconectará de Proa Track y volverás a la pantalla de login.',
    order: 4,
    forProfiles: ['navegante', 'admin', 'coordinador'],
  },

  // ─── Inventario ────────────────────────────────────────────────────────────
  {
    id: 'faq-inventory-1',
    category: 'Inventario',
    question: '¿Cómo agrego un nuevo material al inventario?',
    answer: 'En la sección de Inventario, haz clic en el botón "Nuevo material". Completa los campos requeridos como nombre, descripción, cantidad inicial, ubicación y estado. Luego haz clic en "Guardar" para agregar el material al sistema.',
    order: 1,
    forProfiles: ['admin', 'coordinador'],
  },
  {
    id: 'faq-inventory-2',
    category: 'Inventario',
    question: '¿Qué diferencia hay entre "En uso" y "Disponible"?',
    answer: '"En uso" indica que el material está siendo utilizado actualmente en operaciones. "Disponible" significa que el material está en stock pero no está siendo utilizado en este momento y puede ser asignado a nuevas operaciones.',
    order: 2,
    forProfiles: ['admin', 'coordinador'],
  },
  {
    id: 'faq-inventory-3',
    category: 'Inventario',
    question: '¿Cómo registro un material como perdido?',
    answer: 'En la tarjeta del material, selecciona el estado "Perdido" y proporciona una descripción de las circunstancias. El material se marcará como no disponible y aparecerá en los reportes de pérdidas para seguimiento administrativo.',
    order: 3,
    forProfiles: ['admin', 'coordinador'],
  },
  {
    id: 'faq-inventory-4',
    category: 'Inventario',
    question: '¿Cómo filtro materiales por ubicación o estado?',
    answer: 'En la vista de Inventario, utiliza los filtros en la parte superior. Puedes filtrar por estado (En uso, Disponible, En reparación, Perdido), ubicación, OSC, plaza o rango de fechas. Puedes combinar múltiples filtros para resultados más específicos.',
    order: 4,
    forProfiles: ['admin', 'coordinador'],
  },
  {
    id: 'faq-inventory-5',
    category: 'Inventario',
    question: '¿Qué son los materiales sin movimiento?',
    answer: 'Los materiales sin movimiento son aquellos que no han registrado cambios de estado o ubicación en un período determinado (generalmente 90 días). El sistema alerta sobre estos para evaluar si siguen siendo necesarios o si pueden ser retirados del inventario.',
    order: 5,
    forProfiles: ['admin', 'coordinador'],
  },

  // ─── Equipo ────────────────────────────────────────────────────────────────────────────
  {
    id: 'faq-equipment-1',
    category: 'Equipo',
    question: '¿Qué puedo ver en "Mi equipo"?',
    answer: 'En "Mi equipo" podés ver la lista de personas de tu equipo: nombre, puesto, email y país. También podés buscar por nombre, puesto o email para encontrar a alguien rápidamente. Haciendo clic en un integrante podés ver los materiales que tiene asignados.',
    order: 1,
    forProfiles: ['admin', 'coordinador'],
  },
  {
    id: 'faq-equipment-2',
    category: 'Equipo',
    question: '¿Qué son los "Materiales del equipo"?',
    answer: '"Materiales del equipo" muestra todos los materiales asignados a los integrantes de tu equipo en una sola vista. Podés buscar por responsable, tipo de material o plaza. Es útil para tener visibilidad del inventario completo del equipo sin tener que revisar a cada persona por separado.',
    order: 2,
    forProfiles: ['admin', 'coordinador'],
  },
  {
    id: 'faq-equipment-3',
    category: 'Equipo',
    question: '¿Cómo reviso las confirmaciones de tenencia de mi equipo?',
    answer: 'En "Confirmaciones" podés ver el historial de confirmaciones de tenencia de todos los integrantes de tu equipo. La vista muestra quién confirmó, qué material confirmó y en qué fecha. También podés ver quiénes tienen confirmaciones pendientes para el mes actual y hacer seguimiento.',
    order: 3,
    forProfiles: ['admin', 'coordinador'],
  },

  // ─── Reportes ──────────────────────────────────────────────────────────────
  {
    id: 'faq-reports-1',
    category: 'Reportes',
    question: '¿Qué información incluyen los reportes?',
    answer: 'Los reportes incluyen información sobre el inventario, estado de confirmaciones mensuales, solicitudes de movimiento pendientes, materiales en diferentes estados (en uso, disponible, en reparación, perdido), y alertas de materiales sin movimiento en los últimos 90 días.',
    order: 1,
    forProfiles: ['admin', 'coordinador'],
  },
  {
    id: 'faq-reports-2',
    category: 'Reportes',
    question: '¿Dónde accedo a los reportes?',
    answer: 'Los reportes están disponibles en la sección "Reportes" del menú lateral. Solo administradores y coordinadores/as regionales tienen acceso a esta sección. Los reportes se generan basándose en los datos actuales del sistema.',
    order: 2,
    forProfiles: ['admin', 'coordinador'],
  },
  {
    id: 'faq-reports-3',
    category: 'Reportes',
    question: '¿Qué tipos de reportes hay disponibles?',
    answer: 'Puedes ver reportes del estado general del inventario, confirmaciones pendientes, solicitudes de movimiento, materiales sin movimiento, y análisis por equipo o ubicación. Los datos en los reportes se actualizan automáticamente según cambios en el sistema.',
    order: 3,
    forProfiles: ['admin', 'coordinador'],
  },
  {
    id: 'faq-reports-4',
    category: 'Reportes',
    question: '¿Con qué frecuencia se actualizan los reportes?',
    answer: 'Los reportes se actualizan en tiempo real. Cualquier cambio en el inventario, estado de solicitudes o confirmaciones se refleja inmediatamente en el sistema y en los datos reportados.',
    order: 4,
    forProfiles: ['admin', 'coordinador'],
  },

  // ─── Solicitudes ───────────────────────────────────────────────────────────
  {
    id: 'faq-requests-1',
    category: 'Solicitudes',
    question: '¿Qué son las solicitudes de movimiento?',
    answer: 'Las solicitudes de movimiento son pedidos formales de cambio de responsable o ubicación de materiales. Los navegantes pueden reportar movimientos de materiales desde "Mis materiales", y los coordinadores/as regionales o administradores deben aprobarlas. Puedes ver el estado de tus solicitudes en la sección "Solicitudes".',
    order: 1,
    forProfiles: ['navegante', 'admin', 'coordinador'],
  },
  {
    id: 'faq-requests-2',
    category: 'Solicitudes',
    question: '¿Cuál es el flujo de una solicitud de movimiento?',
    answer: 'El navegante reporta el movimiento → la solicitud queda en estado "Pendiente" → un coordinador/a regional o administrador revisa y aprueba o rechaza → si se aprueba, la solicitud cambia a estado "Aprobada" y el material se registra bajo el nuevo responsable. Puedes ver el estado en la sección "Solicitudes".',
    order: 2,
    forProfiles: ['navegante', 'admin', 'coordinador'],
  },
  {
    id: 'faq-requests-3',
    category: 'Solicitudes',
    question: '¿Qué hago si mi solicitud de movimiento es rechazada?',
    answer: 'Si una solicitud es rechazada, verás el estado actualizado en "Solicitudes". Puedes crear una nueva solicitud reportando el movimiento nuevamente desde "Mis materiales", o contactar a tu coordinador/a regional para discutir el motivo del rechazo.',
    order: 3,
    forProfiles: ['navegante', 'admin', 'coordinador'],
  },
  {
    id: 'faq-requests-4',
    category: 'Solicitudes',
    question: '¿Dónde veo todas las solicitudes?',
    answer: 'Las solicitudes se encuentran en la sección "Solicitudes" del menú lateral. Los navegantes ven las solicitudes que han creado. Los coordinadores/as regionales y administradores ven todas las solicitudes de su equipo u organización, incluyendo las que requieren aprobación.',
    order: 4,
    forProfiles: ['navegante', 'admin', 'coordinador'],
  },

  // ─── Confirmaciones ────────────────────────────────────────────────────────
  {
    id: 'faq-confirmations-1',
    category: 'Confirmaciones',
    question: '¿Qué es la confirmación de tenencia?',
    answer: 'La confirmación de tenencia es el proceso donde verificas que realmente tenés los materiales asignados a tu responsabilidad. Al confirmar, indicás que el material existe, está en buen estado, y que lo tenés en tu poder. Esto asegura que el inventario en el sistema coincida con la realidad física.',
    order: 1,
    forProfiles: ['navegante', 'admin', 'coordinador'],
  },
  {
    id: 'faq-confirmations-2',
    category: 'Confirmaciones',
    question: '¿Cuándo debo confirmar la tenencia de mis materiales?',
    answer: 'Puedes confirmar la tenencia en cualquier momento desde "Mis materiales". Sin embargo, tu organización puede requerir que lo hagas periódicamente (mensualmente, trimestralmente, etc.). Recibirás notificaciones si hay plazos que cumplir. Es importante completarla a tiempo para mantener registros precisos.',
    order: 2,
    forProfiles: ['navegante', 'admin', 'coordinador'],
  },
  {
    id: 'faq-confirmations-3',
    category: 'Confirmaciones',
    question: '¿Cómo confirmo que tengo un material?',
    answer: 'Ve a "Mis materiales" y localiza el material que querés confirmar. Haz clic en el botón con los 3 puntos (⋮) al lado del material y selecciona "Confirmar tenencia". Se abrirá un formulario donde puedes agregar una nota opcional y debes subir una foto del material. Haz clic en "Confirmar" para completar. Esto registra que verificaste el material y que lo tenés en tu poder.',
    order: 3,
    forProfiles: ['navegante', 'admin', 'coordinador'],
  },
  {
    id: 'faq-confirmations-4',
    category: 'Confirmaciones',
    question: '¿Qué pasa si no confirmo mis materiales a tiempo?',
    answer: 'Si no confirmas tus materiales en el período requerido, tu coordinador/a regional o administrador recibirá alertas de materiales pendientes de confirmación. Es importante completarla para mantener registros precisos del inventario y cumplir con los requisitos de auditoría de tu organización.',
    order: 4,
    forProfiles: ['navegante', 'admin', 'coordinador'],
  },
];

export const FAQ_CATEGORIES = ['General', 'Inventario', 'Equipo', 'Reportes', 'Solicitudes', 'Confirmaciones'] as const;
