import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import {
  IconAlertTriangle,
  IconBell,
  IconCircleCheck,
  IconDotsVertical,
  IconMailbox,
  IconTool,
  IconTrash,
  IconUserPlus,
  IconUserX,
} from '@material-hu/icons/tabler';
import IconButton from '@material-hu/mui/IconButton';
import Stack from '@material-hu/mui/Stack';

import Button from '@material-hu/components/design-system/Buttons/Button';
import { useDialogLayer } from '@material-hu/components/layers/Dialogs';
import { useDrawerLayer } from '@material-hu/components/layers/Drawers';
import { useMenuLayer } from '@material-hu/components/layers/Menus';

import { DISPATCHED_NOTIFS_KEY } from '../../../../../hooks/useDispatchedNotifications';
import { useAuth } from '../../../../../providers/AuthContext';
import { type Material } from '../../../List/types';
import { useMaterialMutations } from '../../hooks/useMaterialMutations';
import { useGetPersons } from '../../../../People/List/hooks/useGetPersons';

import AssignDrawer from './AssignDrawer';
import ConfirmDialog from './ConfirmDialog';
import DeleteDialog from './DeleteDialog';
import MarkRecoveredDialog from './MarkRecoveredDialog';
import ReportDialog from './ReportDialog';
import SendToRepairDialog from './SendToRepairDialog';

type MaterialActionsProps = {
  material: Material;
};

const MaterialActions = ({ material }: MaterialActionsProps) => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { openDrawer, closeDrawer } = useDrawerLayer();
  const { openDialog, closeDialog } = useDialogLayer();
  const { openMenu } = useMenuLayer();
  const { assign, report, confirm, repair, recover, remove } =
    useMaterialMutations(material.id);
  const { persons } = useGetPersons();

  const hasResponsable = !!material.responsableNombre;
  const canSendToRepair =
    material.estadoFisico === 'dañado' && material.estado !== 'en_reparacion';
  const canMarkRecovered =
    material.estado === 'perdida' || material.estado === 'en_reparacion';

  const handleAssign = useCallback(
    async (input: {
      personId: string;
      comodato: boolean;
      observacion: string;
    }) => {
      const person = persons.find(p => p.id === input.personId);
      if (!person) return;
      await assign.mutateAsync({
        person,
        comodato: input.comodato,
        observacion: input.observacion,
      });
      closeDrawer();

      // Fire in-app notification to the recipient (best-effort, non-blocking)
      const recipientEmail = (person as { email?: string }).email;
      if (recipientEmail) {
        const dispatcherName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Admin';
        const dispatcherId =
          (user as { employeeInternalId?: string } | null)?.employeeInternalId ??
          String((user as { id?: number } | null)?.id ?? 'admin');
        const isReassign = !!material.responsableNombre;
        fetch('/api/notifications/send-custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userIds: [recipientEmail],
            title: isReassign ? 'Material reasignado' : 'Nuevo material asignado',
            body: `Se te asignó un material. Revisá "Mis materiales" para confirmar la tenencia.`,
            url: '/my-materials',
            dispatcherName,
            dispatcherId,
          }),
        })
          .then(() => qc.invalidateQueries({ queryKey: DISPATCHED_NOTIFS_KEY }))
          .catch(err => console.error('[assign] notification dispatch failed:', err));
      }
    },
    [persons, assign, closeDrawer, material.responsableNombre, user, qc],
  );

  const handleReport = async (kind: 'perdido' | 'dañado', motivo: string) => {
    await report.mutateAsync({ kind, motivo });
    closeDialog();
  };

  const handleConfirm = async (kind: 'devolucion' | 'notificar') => {
    await confirm.mutateAsync({ kind });
    closeDialog();
  };

  const handleSendToRepair = async (taller: string) => {
    await repair.mutateAsync({ taller });
    closeDialog();
  };

  const handleMarkRecovered = async (input: {
    comentario: string;
    quedaOk: boolean;
  }) => {
    await recover.mutateAsync(input);
    closeDialog();
  };

  const handleAssignDrawerClose = useCallback(() => {
    closeDrawer();
  }, [closeDrawer]);

  const openAssignDrawer = useCallback(() => {
    openDrawer({
      wrapperProps: { anchor: 'right' },
      content: (
        <AssignDrawer
          material={material}
          persons={persons}
          onClose={handleAssignDrawerClose}
          onSubmit={handleAssign}
        />
      ),
    });
  }, [material, persons, handleAssignDrawerClose, handleAssign, openDrawer]);

  const openReport = (kind: 'perdido' | 'dañado') => {
    openDialog({
      content: (
        <ReportDialog
          kind={kind}
          material={material}
          onClose={() => closeDialog()}
          onSubmit={motivo => handleReport(kind, motivo)}
        />
      ),
    });
  };

  const openConfirm = (kind: 'devolucion' | 'notificar') => {
    openDialog({
      content: (
        <ConfirmDialog
          kind={kind}
          material={material}
          onClose={() => closeDialog()}
          onSubmit={() => handleConfirm(kind)}
        />
      ),
    });
  };

  const openSendToRepair = () => {
    openDialog({
      content: (
        <SendToRepairDialog
          material={material}
          onClose={() => closeDialog()}
          onSubmit={handleSendToRepair}
        />
      ),
    });
  };

  const openMarkRecovered = () => {
    openDialog({
      content: (
        <MarkRecoveredDialog
          material={material}
          onClose={() => closeDialog()}
          onSubmit={handleMarkRecovered}
        />
      ),
    });
  };

  const openDeleteDialog = () => {
    openDialog({
      content: (
        <DeleteDialog
          material={material}
          onClose={() => closeDialog()}
          onConfirm={async () => {
            await remove.mutateAsync();
            closeDialog();
            navigate('/inventory');
          }}
        />
      ),
    });
  };

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    const items = [
      ...(hasResponsable
        ? [
            {
              id: 'devolucion',
              title: 'Solicitar devolución',
              icon: IconMailbox,
              onSelect: () => openConfirm('devolucion'),
            },
            {
              id: 'notificar',
              title: 'Notificar al responsable',
              icon: IconBell,
              onSelect: () => openConfirm('notificar'),
            },
          ]
        : []),
      ...(canMarkRecovered
        ? [
            {
              id: 'recuperado',
              title: 'Marcar como recuperado',
              icon: IconCircleCheck,
              onSelect: openMarkRecovered,
            },
          ]
        : []),
      ...(canSendToRepair
        ? [
            {
              id: 'reparacion',
              title: 'Enviar a reparación',
              icon: IconTool,
              onSelect: openSendToRepair,
            },
          ]
        : []),
      {
        id: 'perdido',
        title: 'Marcar como perdido',
        icon: IconUserX,
        onSelect: () => openReport('perdido'),
      },
      {
        id: 'dañado',
        title: 'Marcar como dañado',
        icon: IconAlertTriangle,
        onSelect: () => openReport('dañado'),
      },
      {
        id: 'eliminar',
        title: 'Eliminar material',
        icon: IconTrash,
        onSelect: openDeleteDialog,
      },
    ];

    openMenu({
      anchorEl: event.currentTarget,
      items,
    });
  };

  return (
    <Stack sx={{ flexDirection: 'row', gap: 1, alignItems: 'center' }}>
      <Button
        variant="primary"
        size="medium"
        startIcon={<IconUserPlus size={18} />}
        onClick={openAssignDrawer}
      >
        {hasResponsable ? 'Reasignar' : 'Asignar'}
      </Button>
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

export default MaterialActions;
