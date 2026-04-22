import { useState } from 'react';

import {
  IconAlertTriangle,
  IconArrowRight,
  IconCircleCheck,
  IconDotsVertical,
  IconUserX,
} from '@material-hu/icons/tabler';
import IconButton from '@material-hu/mui/IconButton';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Button from '@material-hu/components/design-system/Buttons/Button';
import InputClassic from '@material-hu/components/design-system/Inputs/Classic';
import { useDialogLayer } from '@material-hu/components/layers/Dialogs';
import { useMenuLayer } from '@material-hu/components/layers/Menus';

import { useMaterialMutations } from '../../../../Inventory/Detail/hooks/useMaterialMutations';
import { type Material } from '../../../../Inventory/List/types';

type Props = { material: Material };

const MaterialRowActions = ({ material }: Props) => {
  const { openMenu } = useMenuLayer();
  const { openDialog, closeDialog } = useDialogLayer();
  const { report, confirm } = useMaterialMutations(material.id);

  const handleMenuClick = (e: React.MouseEvent<HTMLElement>) => {
    openMenu({
      anchorEl: e.currentTarget,
      items: [
        {
          id: 'tenencia',
          title: 'Confirmar tenencia',
          icon: IconCircleCheck,
          onSelect: () =>
            openDialog({
              content: (
                <ConfirmarTenenciaDialog
                  onClose={closeDialog}
                  onSubmit={async () => {
                    await confirm.mutateAsync({ kind: 'notificar' });
                    closeDialog();
                  }}
                />
              ),
            }),
        },
        {
          id: 'daño',
          title: 'Reportar daño',
          icon: IconAlertTriangle,
          onSelect: () =>
            openDialog({
              content: (
                <ReportarDialog
                  titulo="Reportar daño"
                  descripcion="Describí el daño que tiene el material."
                  onClose={closeDialog}
                  onSubmit={async motivo => {
                    await report.mutateAsync({ kind: 'dañado', motivo });
                    closeDialog();
                  }}
                />
              ),
            }),
        },
        {
          id: 'perdida',
          title: 'Reportar pérdida',
          icon: IconUserX,
          onSelect: () =>
            openDialog({
              content: (
                <ReportarDialog
                  titulo="Reportar pérdida"
                  descripcion="Describí las circunstancias de la pérdida."
                  onClose={closeDialog}
                  onSubmit={async motivo => {
                    await report.mutateAsync({ kind: 'perdido', motivo });
                    closeDialog();
                  }}
                />
              ),
            }),
        },
        {
          id: 'movimiento',
          title: 'Reportar movimiento',
          icon: IconArrowRight,
          onSelect: () =>
            openDialog({
              content: (
                <ReportarDialog
                  titulo="Reportar movimiento"
                  descripcion="Indicá a quién le entregaste el material y el motivo. Un líder o admin deberá aprobarlo."
                  onClose={closeDialog}
                  onSubmit={async motivo => {
                    await confirm.mutateAsync({ kind: 'devolucion' });
                    closeDialog();
                  }}
                />
              ),
            }),
        },
      ],
    });
  };

  return (
    <IconButton size="small" onClick={handleMenuClick} aria-label="Acciones">
      <IconDotsVertical size={18} />
    </IconButton>
  );
};

export default MaterialRowActions;

// ─── Shared dialog components ─────────────────────────────────────────────────

type ReportarDialogProps = {
  titulo: string;
  descripcion: string;
  onClose: () => void;
  onSubmit: (motivo: string) => Promise<void>;
};

const ReportarDialog = ({
  titulo,
  descripcion,
  onClose,
  onSubmit,
}: ReportarDialogProps) => {
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(motivo);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack sx={{ p: 3, gap: 3, minWidth: 360, maxWidth: 480 }}>
      <Stack sx={{ gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {titulo}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {descripcion}
        </Typography>
      </Stack>
      <InputClassic
        label="Descripción"
        placeholder="Contá qué pasó..."
        multiline
        minRows={3}
        maxRows={6}
        value={motivo}
        onChange={setMotivo}
        fullWidth
      />
      <Stack sx={{ flexDirection: 'row', gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="tertiary" size="medium" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="medium"
          onClick={handleSubmit}
          loading={loading}
        >
          Confirmar
        </Button>
      </Stack>
    </Stack>
  );
};

type ConfirmarTenenciaDialogProps = {
  onClose: () => void;
  onSubmit: () => Promise<void>;
};

const ConfirmarTenenciaDialog = ({
  onClose,
  onSubmit,
}: ConfirmarTenenciaDialogProps) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack sx={{ p: 3, gap: 3, minWidth: 360, maxWidth: 480 }}>
      <Stack sx={{ gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Confirmar tenencia
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Confirmás que tenés el material en tu poder y está en buen estado.
        </Typography>
      </Stack>
      <Stack sx={{ flexDirection: 'row', gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="tertiary" size="medium" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="medium"
          onClick={handleSubmit}
          loading={loading}
        >
          Sí, confirmo
        </Button>
      </Stack>
    </Stack>
  );
};
