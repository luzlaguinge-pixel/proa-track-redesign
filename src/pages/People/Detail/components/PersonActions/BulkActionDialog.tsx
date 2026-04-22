import { useState } from 'react';

import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Button from '@material-hu/components/design-system/Buttons/Button';
import Dialog from '@material-hu/components/design-system/Dialog';

type BulkActionDialogProps = {
  title: string;
  description: string;
  primaryLabel: string;
  primaryColor?: 'primary' | 'error';
  materialsCount: number;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
};

const BulkActionDialog = ({
  title,
  description,
  primaryLabel,
  primaryColor = 'primary',
  materialsCount,
  onClose,
  onSubmit,
}: BulkActionDialogProps) => {
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
        title={title}
        onClose={onClose}
      />
      <Dialog.Body>
        <Stack sx={{ gap: 1.5 }}>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {description}
          </Typography>
          <Typography variant="body2">
            Materiales afectados: <strong>{materialsCount}</strong>
          </Typography>
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
            color={primaryColor}
            onClick={handleSubmit}
            loading={submitting}
          >
            {primaryLabel}
          </Button>
        </Stack>
      </Dialog.Footer>
    </>
  );
};

export default BulkActionDialog;
