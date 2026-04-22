import { useState } from 'react';

import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Button from '@material-hu/components/design-system/Buttons/Button';
import Dialog from '@material-hu/components/design-system/Dialog';

import { type Material } from '../../../List/types';

type ConfirmKind = 'devolucion' | 'notificar';

type ConfirmDialogProps = {
  kind: ConfirmKind;
  material: Material;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
};

const COPY: Record<
  ConfirmKind,
  { title: string; description: string; primary: string }
> = {
  devolucion: {
    title: 'Solicitar devolución',
    description:
      'Se le enviará una notificación al responsable pidiéndole que devuelva el material.',
    primary: 'Solicitar devolución',
  },
  notificar: {
    title: 'Notificar al responsable',
    description:
      'Se le enviará una notificación al responsable pidiéndole que confirme si sigue teniendo el material.',
    primary: 'Notificar',
  },
};

const ConfirmDialog = ({
  kind,
  material,
  onClose,
  onSubmit,
}: ConfirmDialogProps) => {
  const copy = COPY[kind];
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog.Header
        title={copy.title}
        onClose={onClose}
      />
      <Dialog.Body>
        <Stack sx={{ gap: 1.5 }}>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {copy.description}
          </Typography>
          {material.responsableNombre && (
            <Typography variant="body2">
              Responsable: <strong>{material.responsableNombre}</strong>
            </Typography>
          )}
        </Stack>
      </Dialog.Body>
      <Dialog.Footer>
        <Stack
          sx={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 1 }}
        >
          <Button
            variant="tertiary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
          >
            {copy.primary}
          </Button>
        </Stack>
      </Dialog.Footer>
    </>
  );
};

export default ConfirmDialog;
