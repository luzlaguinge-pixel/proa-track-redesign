import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import {
  IconBell,
  IconCircleCheck,
  IconDotsVertical,
  IconMailbox,
  IconMoonStars,
  IconSunHigh,
  IconUserCheck,
  IconUserMinus,
  IconUserPlus,
  IconX,
} from '@material-hu/icons/tabler';
import IconButton from '@material-hu/mui/IconButton';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Button from '@material-hu/components/design-system/Buttons/Button';
import { useDialogLayer } from '@material-hu/components/layers/Dialogs';
import { useDrawerLayer } from '@material-hu/components/layers/Drawers';
import { useMenuLayer } from '@material-hu/components/layers/Menus';

import { useAuth } from '../../../../../providers/AuthContext';
import { type Material } from '../../../../Inventory/List/types';
import { getAllMaterials } from '../../../../Inventory/store';
import {
  isOnLeave,
  isPendingRecovery,
  setActive,
  setLifecycle,
} from '../../../lifecycleStore';
import { usePersonMutations } from '../../hooks/usePersonMutations';
import { type PersonDetail } from '../../types';

import AssignMaterialDrawer from './AssignMaterialDrawer';
import BulkActionDialog from './BulkActionDialog';

type PersonActionsProps = {
  person: PersonDetail;
  materials: Material[];
};

const PersonActions = ({ person, materials }: PersonActionsProps) => {
  const { openDrawer, closeDrawer } = useDrawerLayer();
  const { openDialog, closeDialog } = useDialogLayer();
  const { openMenu } = useMenuLayer();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { assignNew, notifyAll, requestReturnAll, recoverAll, returnAll } =
    usePersonMutations(person);

  const hasMaterials = materials.length > 0;
  const isInPendingRecovery = isPendingRecovery(person.id);
  const isInOnLeave = isOnLeave(person.id);

  /** Invalidate all queries that depend on lifecycle state. */
  const invalidateLifecycleQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['persons'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const openAssign = async () => {
    const available = (await getAllMaterials()).filter(
      m => m.estado === 'sin_uso',
    );
    openDrawer({
      wrapperProps: { anchor: 'right' },
      content: (
        <AssignMaterialDrawer
          availableMaterials={available}
          personNombre={person.nombre}
          onClose={() => closeDrawer()}
          onSubmit={async input => {
            await assignNew.mutateAsync(input);
            closeDrawer();
          }}
        />
      ),
    });
  };

  const openBulk = (kind: 'notificar' | 'devolucion' | 'recuperados') => {
    const configs = {
      notificar: {
        title: 'Notificar al responsable',
        description:
          'Se le enviará una notificación a la persona para que confirme si sigue teniendo los materiales.',
        primaryLabel: 'Notificar',
        primaryColor: 'primary' as const,
        action: () =>
          notifyAll.mutateAsync(materials).then(() => closeDialog()),
      },
      devolucion: {
        title: 'Solicitar devolución',
        description:
          'Se le enviará una notificación pidiendo que devuelva todos sus materiales.',
        primaryLabel: 'Solicitar devolución',
        primaryColor: 'primary' as const,
        action: () =>
          requestReturnAll.mutateAsync(materials).then(() => closeDialog()),
      },
      recuperados: {
        title: isInPendingRecovery
          ? 'Materiales recuperados — finalizar baja'
          : 'Materiales recuperados',
        description: isInPendingRecovery
          ? `Se registrará la recuperación de ${materials.length} ${materials.length === 1 ? 'material' : 'materiales'}. Al confirmar, la baja de ${person.nombre} quedará completada y la persona será eliminada de todas las vistas activas.`
          : 'Se registrará la devolución de todos los materiales de esta persona.',
        primaryLabel: isInPendingRecovery
          ? 'Recuperar y finalizar baja'
          : 'Marcar como recuperados',
        primaryColor: 'primary' as const,
        action: () =>
          recoverAll.mutateAsync(materials).then(() => {
            invalidateLifecycleQueries();
            closeDialog();
          }),
      },
    };

    const cfg = configs[kind];
    openDialog({
      content: (
        <BulkActionDialog
          title={cfg.title}
          description={cfg.description}
          primaryLabel={cfg.primaryLabel}
          primaryColor={cfg.primaryColor}
          materialsCount={materials.length}
          onClose={() => closeDialog()}
          onSubmit={cfg.action}
        />
      ),
    });
  };

  /** Initiates the offboarding process. */
  const openBaja = () => {
    if (hasMaterials) {
      // Two-step flow: move to pending_recovery first, send recovery notification
      openDialog({
        content: (
          <BajaConMaterialesDialog
            person={person}
            materialCount={materials.length}
            currentUserId={
              (user as { employeeInternalId?: string } | null)
                ?.employeeInternalId ??
              String((user as { id?: number } | null)?.id ?? '')
            }
            onConfirm={(lastDay?: string) => {
              setLifecycle(
                person.id,
                'pending_recovery',
                person.nombre,
                materials.length,
                lastDay,
              );
              sendBajaNotification(person.nombre, materials);
              invalidateLifecycleQueries();
              closeDialog();
            }}
            onCancel={closeDialog}
          />
        ),
      });
    } else {
      // No materials — terminate immediately
      openDialog({
        content: (
          <BulkActionDialog
            title="Dar de baja"
            description="Se registrará la baja de esta persona. Desaparecerá de todas las vistas activas, pero su historial permanecerá accesible."
            primaryLabel="Dar de baja"
            primaryColor="error"
            materialsCount={0}
            onClose={() => closeDialog()}
            onSubmit={() => {
              setLifecycle(person.id, 'terminated', person.nombre, 0);
              invalidateLifecycleQueries();
              closeDialog();
            }}
          />
        ),
      });
    }
  };

  /** Finalise baja manually when person is pending_recovery and has 0 materials. */
  const openFinalizarBaja = () => {
    openDialog({
      content: (
        <BulkActionDialog
          title="Finalizar baja"
          description="Todos los materiales ya fueron recuperados. Al confirmar, la persona quedará completamente dada de baja y desaparecerá de todas las vistas activas."
          primaryLabel="Finalizar baja"
          primaryColor="error"
          materialsCount={0}
          onClose={() => closeDialog()}
          onSubmit={() => {
            setLifecycle(person.id, 'terminated', person.nombre, 0);
            invalidateLifecycleQueries();
            closeDialog();
          }}
        />
      ),
    });
  };

  /** Toggle on_leave — no material resolution needed, just a temporary flag. */
  const openSetOnLeave = () => {
    openDialog({
      content: (
        <BulkActionDialog
          title="Poner en licencia"
          description={`${person.nombre} aparecerá marcada/o como "en licencia" en todas las vistas pero seguirá siendo visible y podrá tener materiales asignados. Podés revertirlo en cualquier momento.`}
          primaryLabel="Poner en licencia"
          primaryColor="primary"
          materialsCount={0}
          onClose={() => closeDialog()}
          onSubmit={() => {
            setLifecycle(person.id, 'on_leave', person.nombre, 0);
            invalidateLifecycleQueries();
            closeDialog();
          }}
        />
      ),
    });
  };

  const handleReturnFromLeave = () => {
    setActive(person.id);
    invalidateLifecycleQueries();
  };

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    const items = [
      {
        id: 'notificar',
        title: 'Notificar',
        icon: IconBell,
        onSelect: () => openBulk('notificar'),
      },
      {
        id: 'devolucion',
        title: 'Solicitar devolución',
        icon: IconMailbox,
        onSelect: () => openBulk('devolucion'),
      },
      {
        id: 'recuperados',
        title: isInPendingRecovery
          ? 'Recuperar materiales y finalizar baja'
          : 'Materiales recuperados',
        icon: IconCircleCheck,
        onSelect: () => openBulk('recuperados'),
      },
    ];

    if (!isInPendingRecovery) {
      if (isInOnLeave) {
        items.push({
          id: 'return_leave',
          title: 'Volver de licencia',
          icon: IconSunHigh,
          onSelect: handleReturnFromLeave,
        });
      } else {
        items.push({
          id: 'on_leave',
          title: 'Poner en licencia',
          icon: IconMoonStars,
          onSelect: openSetOnLeave,
        });
        items.push({
          id: 'baja',
          title: 'Dar de baja',
          icon: IconUserMinus,
          onSelect: openBaja,
        });
      }
    } else if (!hasMaterials) {
      // pending_recovery with 0 materials → show "Finalizar baja" shortcut
      items.push({
        id: 'finalizar',
        title: 'Finalizar baja',
        icon: IconUserCheck,
        onSelect: openFinalizarBaja,
      });
    }

    openMenu({ anchorEl: event.currentTarget, items });
  };

  return (
    <Stack sx={{ flexDirection: 'row', gap: 1, alignItems: 'center' }}>
      {!isInPendingRecovery && (
        <Button
          variant="primary"
          size="medium"
          startIcon={<IconUserPlus size={18} />}
          onClick={openAssign}
        >
          Asignar material
        </Button>
      )}
      {isInPendingRecovery && !hasMaterials && (
        <Button
          variant="secondary"
          size="medium"
          startIcon={<IconUserMinus size={18} />}
          onClick={openFinalizarBaja}
        >
          Finalizar baja
        </Button>
      )}
      <IconButton
        size="small"
        onClick={handleMoreClick}
        aria-label="Más acciones"
      >
        <IconDotsVertical size={20} />
      </IconButton>
    </Stack>
  );
};

export default PersonActions;

// ─── BajaConMaterialesDialog ──────────────────────────────────────────────────

type BajaConMaterialesDialogProps = {
  person: { nombre: string };
  materialCount: number;
  currentUserId: string;
  onConfirm: (lastDay?: string) => void;
  onCancel: () => void;
};

const BajaConMaterialesDialog = ({
  person,
  materialCount,
  onConfirm,
  onCancel,
}: BajaConMaterialesDialogProps) => {
  const [lastDay, setLastDay] = useState('');

  return (
    <Stack sx={{ gap: 2.5, p: 0.5 }}>
      <Stack sx={{ gap: 0.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Dar de baja — materiales asignados
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {person.nombre} tiene{' '}
          <strong>
            {materialCount} {materialCount === 1 ? 'material' : 'materiales'}
          </strong>{' '}
          asignados.
        </Typography>
      </Stack>

      <Stack
        sx={{
          gap: 1,
          bgcolor: 'warning.50',
          p: 2,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'warning.200',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          ¿Qué pasará al confirmar?
        </Typography>
        <Typography variant="body2">
          • La persona se ocultará de todas las vistas activas de inmediato.
        </Typography>
        <Typography variant="body2">
          • Sus materiales quedarán pendientes de recuperación física.
        </Typography>
        <Typography variant="body2">
          • Recibirás una notificación con el detalle de materiales a recuperar.
        </Typography>
        <Typography variant="body2">
          • La baja se completará cuando recuperes todos los materiales.
        </Typography>
      </Stack>

      {/* Optional last-day field — triggers escalation alert on dashboard */}
      <Stack sx={{ gap: 0.75 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Último día de trabajo{' '}
          <Typography component="span" variant="caption" color="text.secondary">
            (opcional)
          </Typography>
        </Typography>
        <input
          type="date"
          value={lastDay}
          onChange={e => setLastDay(e.target.value)}
          style={{
            border: '1px solid #ccc',
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 14,
            fontFamily: 'inherit',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        <Typography variant="caption" color="text.secondary">
          Si se configura, el dashboard escalará la alerta cuando esta fecha
          pase con materiales pendientes.
        </Typography>
      </Stack>

      <Typography variant="caption" color="text.secondary">
        El historial de esta persona permanecerá siempre accesible para
        auditoría, con la marca <em>(baja)</em>.
      </Typography>

      <Stack
        sx={{ flexDirection: 'row', gap: 1, justifyContent: 'flex-end' }}
      >
        <Button variant="text" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          variant="secondary"
          onClick={() => onConfirm(lastDay || undefined)}
          startIcon={<IconX size={16} />}
        >
          Iniciar proceso de baja
        </Button>
      </Stack>
    </Stack>
  );
};

// ─── Helper: fire recovery notification ──────────────────────────────────────

function sendBajaNotification(nombre: string, materials: Material[]): void {
  const materialCount = materials.length;
  const materialList = materials
    .slice(0, 5)
    .map(m => m.tipo)
    .join(', ');
  const ellipsis = materialCount > 5 ? ` (+${materialCount - 5} más)` : '';

  fetch('/api/notifications/send-custom', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userIds: [], // all admins / subscribed users
      title: `Baja iniciada: ${nombre}`,
      body: `${nombre} fue dado/a de baja. Materiales a recuperar (${materialCount}): ${materialList}${ellipsis}.`,
      url: '/people',
      dispatcherName: 'sistema',
      dispatcherId: 'system-baja',
    }),
  }).catch(err => {
    console.warn('[Baja] Recovery notification failed (non-fatal):', err);
  });
}
