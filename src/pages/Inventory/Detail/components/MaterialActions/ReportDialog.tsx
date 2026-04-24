import { useState } from 'react';

import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Button from '@material-hu/components/design-system/Buttons/Button';
import Dialog from '@material-hu/components/design-system/Dialog';
import InputClassic from '@material-hu/components/design-system/Inputs/Classic';

import { type Material } from '../../../List/types';

type ReportKind = 'perdido' | 'dañado';

type ReportDialogProps = {
  kind: ReportKind;
  material: Material;
  onClose: () => void;
  onSubmit: (motivo: string) => Promise<void> | void;
};

const COPY: Record<
  ReportKind,
  { title: string; intro: string; primary: string }
> = {
  perdido: {
    title: 'Marcar como perdido',
    intro:
      'Se le notificará al admin y al coordinador/a regional para iniciar el seguimiento.',
    primary: 'Marcar perdido',
  },
  dañado: {
    title: 'Marcar como dañado',
    intro: 'Se registrará el daño en el historial del material.',
    primary: 'Marcar dañado',
  },
};

const ReportDialog = ({
  kind,
  material,
  onClose,
  onSubmit,
}: ReportDialogProps) => {
  const copy = COPY[kind];
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!motivo.trim()) {
      setError(true);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(motivo);
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
        <Stack sx={{ gap: 2 }}>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {copy.intro}
          </Typography>
          <Typography variant="body2">
            <strong>{material.osc || '—'}</strong> · {material.plaza}
            {material.responsableNombre
              ? ` · ${material.responsableNombre}`
              : ''}
          </Typography>
          <InputClassic
            label="Motivo"
            placeholder="Describí qué pasó..."
            multiline
            minRows={3}
            maxRows={6}
            value={motivo}
            onChange={value => {
              setMotivo(value);
              if (error) setError(false);
            }}
            error={error}
            errorText={error ? 'El motivo es obligatorio' : undefined}
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
            color="error"
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

export default ReportDialog;
