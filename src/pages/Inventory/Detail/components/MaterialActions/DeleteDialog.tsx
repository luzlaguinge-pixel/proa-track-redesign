import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Button from '@material-hu/components/design-system/Buttons/Button';

import { type Material } from '../../../List/types';
import { TIPO_LABEL } from '../../../List/constants';

type DeleteDialogProps = {
  material: Material;
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteDialog = ({ material, onClose, onConfirm }: DeleteDialogProps) => {
  const label = TIPO_LABEL[material.tipo] + (material.detalle ? ` · ${material.detalle}` : '');

  return (
    <Stack sx={{ p: 3, gap: 3, maxWidth: 440 }}>
      <Stack sx={{ gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Eliminar material
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ¿Seguro que querés eliminar <strong>{label}</strong>? Esta acción no se puede deshacer.
        </Typography>
      </Stack>
      <Stack sx={{ flexDirection: 'row', gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="secondary" size="medium" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="medium"
          onClick={onConfirm}
          sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
        >
          Eliminar
        </Button>
      </Stack>
    </Stack>
  );
};

export default DeleteDialog;
