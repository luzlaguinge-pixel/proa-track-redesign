import IconButton from '@material-hu/mui/IconButton';
import Stack from '@material-hu/mui/Stack';

import Button from '@material-hu/components/design-system/Buttons/Button';
import { useDialogLayer } from '@material-hu/components/layers/Dialogs';
import { useDrawerLayer } from '@material-hu/components/layers/Drawers';
import { useMenuLayer } from '@material-hu/components/layers/Menus';
import {
  IconAlertTriangle,
  IconBell,
  IconDotsVertical,
  IconMailbox,
  IconUserPlus,
  IconUserX,
} from '@material-hu/icons/tabler';

import db from '../../../../../../mock/db.json';
import type { Material } from '../../../List/types';
import { useMaterialMutations } from '../../hooks/useMaterialMutations';
import type { Person } from '../../types';
import AssignDrawer from './AssignDrawer';
import ConfirmDialog from './ConfirmDialog';
import ReportDialog from './ReportDialog';

type MaterialActionsProps = {
  material: Material;
};

const persons = (db as { persons: Person[] }).persons;

const MaterialActions = ({ material }: MaterialActionsProps) => {
  const { openDrawer, closeDrawer } = useDrawerLayer();
  const { openDialog, closeDialog } = useDialogLayer();
  const { openMenu } = useMenuLayer();
  const { assign, report, confirm } = useMaterialMutations(material.id);

  const hasResponsable = !!material.responsableNombre;

  const handleAssign = async (input: {
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
  };

  const handleReport = async (kind: 'perdido' | 'dañado', motivo: string) => {
    await report.mutateAsync({ kind, motivo });
    closeDialog();
  };

  const handleConfirm = async (kind: 'devolucion' | 'notificar') => {
    await confirm.mutateAsync({ kind });
    closeDialog();
  };

  const openAssignDrawer = () => {
    openDrawer({
      wrapperProps: { anchor: 'right' },
      content: (
        <AssignDrawer
          material={material}
          persons={persons}
          onClose={() => closeDrawer()}
          onSubmit={handleAssign}
        />
      ),
    });
  };

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
