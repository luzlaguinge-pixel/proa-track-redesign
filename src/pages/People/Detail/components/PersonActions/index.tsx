import {
  IconBell,
  IconCircleCheck,
  IconDotsVertical,
  IconMailbox,
  IconUserMinus,
  IconUserPlus,
} from '@material-hu/icons/tabler';
import IconButton from '@material-hu/mui/IconButton';
import Stack from '@material-hu/mui/Stack';

import Button from '@material-hu/components/design-system/Buttons/Button';
import { useDialogLayer } from '@material-hu/components/layers/Dialogs';
import { useDrawerLayer } from '@material-hu/components/layers/Drawers';
import { useMenuLayer } from '@material-hu/components/layers/Menus';

import { type Material } from '../../../../Inventory/List/types';
import { getAllMaterials } from '../../../../Inventory/store';
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
  const { assignNew, notifyAll, requestReturnAll, recoverAll, returnAll } =
    usePersonMutations(person);

  const hasMaterials = materials.length > 0;

  const openAssign = () => {
    const available = getAllMaterials().filter(m => m.estado === 'sin_uso');
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

  const openBulk = (
    kind: 'notificar' | 'devolucion' | 'recuperados' | 'baja',
  ) => {
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
        title: 'Materiales recuperados',
        description:
          'Se registrará la devolución de todos los materiales de esta persona.',
        primaryLabel: 'Marcar como recuperados',
        primaryColor: 'primary' as const,
        action: () =>
          recoverAll.mutateAsync(materials).then(() => closeDialog()),
      },
      baja: {
        title: 'Dar de baja',
        description: hasMaterials
          ? 'Esta persona todavía tiene materiales asignados. Primero marcalos como recuperados antes de dar de baja.'
          : 'Se registrará la baja de esta persona. Esta acción no puede deshacerse.',
        primaryLabel: hasMaterials
          ? 'Marcar materiales como recuperados'
          : 'Dar de baja',
        primaryColor: 'error' as const,
        action: hasMaterials
          ? () => recoverAll.mutateAsync(materials).then(() => closeDialog())
          : () => returnAll.mutateAsync(materials).then(() => closeDialog()),
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

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    openMenu({
      anchorEl: event.currentTarget,
      items: [
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
          title: 'Materiales recuperados',
          icon: IconCircleCheck,
          onSelect: () => openBulk('recuperados'),
        },
        {
          id: 'baja',
          title: 'Dar de baja',
          icon: IconUserMinus,
          onSelect: () => openBulk('baja'),
        },
      ],
    });
  };

  return (
    <Stack sx={{ flexDirection: 'row', gap: 1, alignItems: 'center' }}>
      <Button
        variant="primary"
        size="medium"
        startIcon={<IconUserPlus size={18} />}
        onClick={openAssign}
      >
        Asignar material
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

export default PersonActions;
