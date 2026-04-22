import { useState } from 'react';

import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Button from '@material-hu/components/design-system/Buttons/Button';
import Dialog from '@material-hu/components/design-system/Dialog';
import InputClassic from '@material-hu/components/design-system/Inputs/Classic';

import { type Material } from '../../../List/types';

type SendToRepairDialogProps = {
  material: Material;
  onClose: () => void;
  onSubmit: (taller: string) => Promise<void> | void;
};

const SendToRepairDialog = ({
  material,
  onClose,
  onSubmit,
}: SendToRepairDialogProps) => {
  const [taller, setTaller] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(taller);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog.Header
        title="Enviar a reparación"
        onClose={onClose}
      />
      <Dialog.Body>
        <Stack sx={{ gap: 2 }}>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            El material quedará marcado como en reparación hasta que lo des por
            recuperado.
          </Typography>
          <Typography variant="body2">
            <strong>{material.osc || '—'}</strong> · {material.plaza}
          </Typography>
          <InputClassic
            label="Taller o comentario (opcional)"
            placeholder="Ej: Taller central · service oficial..."
            multiline
            minRows={2}
            maxRows={5}
            value={taller}
            onChange={setTaller}
            fullWidth
          />
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
            Enviar a reparación
          </Button>
        </Stack>
      </Dialog.Footer>
    </>
  );
};

export default SendToRepairDialog;
