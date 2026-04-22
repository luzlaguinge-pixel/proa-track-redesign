import { useState } from 'react';

import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Button from '@material-hu/components/design-system/Buttons/Button';
import Dialog from '@material-hu/components/design-system/Dialog';
import InputClassic from '@material-hu/components/design-system/Inputs/Classic';
import Toggle from '@material-hu/components/design-system/Toggle';

import { type Material } from '../../../List/types';

type MarkRecoveredDialogProps = {
  material: Material;
  onClose: () => void;
  onSubmit: (input: {
    comentario: string;
    quedaOk: boolean;
  }) => Promise<void> | void;
};

const MarkRecoveredDialog = ({
  material,
  onClose,
  onSubmit,
}: MarkRecoveredDialogProps) => {
  const comeFromRepair = material.estado === 'en_reparacion';
  const [comentario, setComentario] = useState('');
  const [quedaOk, setQuedaOk] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const intro = comeFromRepair
    ? 'El material vuelve del taller. Contanos cómo quedó.'
    : 'El material fue encontrado. Se registrará en el historial.';

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({ comentario, quedaOk });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog.Header
        title="Marcar como recuperado"
        onClose={onClose}
      />
      <Dialog.Body>
        <Stack sx={{ gap: 2 }}>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {intro}
          </Typography>
          <Typography variant="body2">
            <strong>{material.osc || '—'}</strong> · {material.plaza}
          </Typography>
          {comeFromRepair && (
            <Stack
              sx={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Stack sx={{ gap: 0.25 }}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500 }}
                >
                  Quedó en buen estado
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Si sigue con daños, vuelve a quedar marcado como dañado.
                </Typography>
              </Stack>
              <Toggle
                checked={quedaOk}
                onChange={setQuedaOk}
              />
            </Stack>
          )}
          <InputClassic
            label="Comentario (opcional)"
            placeholder="Detalles de la recuperación..."
            multiline
            minRows={2}
            maxRows={5}
            value={comentario}
            onChange={setComentario}
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
            Marcar recuperado
          </Button>
        </Stack>
      </Dialog.Footer>
    </>
  );
};

export default MarkRecoveredDialog;
