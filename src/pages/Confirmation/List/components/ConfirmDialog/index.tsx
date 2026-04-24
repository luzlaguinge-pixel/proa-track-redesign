import { useRef, useState } from 'react';

import { IconPhoto, IconX } from '@material-hu/icons/tabler';
import Box from '@material-hu/mui/Box';
import IconButton from '@material-hu/mui/IconButton';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Button from '@material-hu/components/design-system/Buttons/Button';
import InputClassic from '@material-hu/components/design-system/Inputs/Classic';

import { type MaterialConEstadoConfirmacion } from '../../services';

type Props = {
  material: MaterialConEstadoConfirmacion;
  onClose: () => void;
  onSubmit: (nota: string, fotoBase64: string | null) => Promise<void>;
};

const ConfirmDialog = ({ material, onClose, onSubmit }: Props) => {
  const [nota, setNota] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setFoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(nota, foto);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack sx={{ p: 3, gap: 3, minWidth: 360, maxWidth: 480 }}>
      <Stack sx={{ gap: 0.5 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600 }}
        >
          Confirmar tenencia
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {material.tipo}
          {material.detalle ? ` · ${material.detalle}` : ''}
        </Typography>
      </Stack>

      <InputClassic
        label="Nota (opcional)"
        placeholder="¿Querés agregar alguna observación?"
        multiline
        minRows={2}
        maxRows={5}
        value={nota}
        onChange={setNota}
        fullWidth
      />

      <Stack sx={{ gap: 1 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 500 }}
        >
          Foto del material
        </Typography>
        {foto ? (
          <Stack sx={{ position: 'relative', alignSelf: 'flex-start' }}>
            <Box
              component="img"
              src={foto}
              alt="foto"
              sx={{
                width: 200,
                height: 140,
                objectFit: 'cover',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
            <IconButton
              size="small"
              onClick={() => setFoto(null)}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                bgcolor: 'background.paper',
              }}
            >
              <IconX size={14} />
            </IconButton>
          </Stack>
        ) : (
          <Button
            variant="secondary"
            size="medium"
            startIcon={<IconPhoto size={16} />}
            onClick={() => fileRef.current?.click()}
            sx={{ alignSelf: 'flex-start' }}
          >
            Subir foto
          </Button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </Stack>

      <Stack sx={{ flexDirection: 'row', gap: 1, justifyContent: 'flex-end' }}>
        <Button
          variant="tertiary"
          size="medium"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="medium"
          onClick={handleSubmit}
          loading={loading}
          disabled={!foto}
        >
          Confirmar
        </Button>
      </Stack>
    </Stack>
  );
};

export default ConfirmDialog;
