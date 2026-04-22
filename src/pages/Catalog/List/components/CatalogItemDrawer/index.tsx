import { useState } from 'react';

import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Drawer from '@material-hu/components/design-system/Drawer';
import Autocomplete from '@material-hu/components/design-system/Inputs/Autocomplete';
import InputClassic from '@material-hu/components/design-system/Inputs/Classic';
import Toggle from '@material-hu/components/design-system/Toggle';

import { CATEGORIA_LABEL, CATEGORIAS } from '../../constants';
import { type CreateCatalogInput } from '../../services';
import { type CatalogItemWithUnidades } from '../../types';

const CATEGORIA_OPTIONS = CATEGORIAS.map(c => ({
  label: CATEGORIA_LABEL[c],
  value: c,
}));

const DUENO_OPTIONS = [
  { label: 'Proa', value: 'proa' as const },
  { label: 'Cliente', value: 'cliente' as const },
];

type CatalogItemDrawerProps = {
  item?: CatalogItemWithUnidades | null;
  onClose: () => void;
  onSubmit: (input: CreateCatalogInput) => Promise<void>;
};

const CatalogItemDrawer = ({
  item,
  onClose,
  onSubmit,
}: CatalogItemDrawerProps) => {
  const [nombre, setNombre] = useState(item?.nombre ?? '');
  const [categoria, setCategoria] = useState(item?.categoria ?? null);
  const [duenoPorDefecto, setDuenoPorDefecto] = useState(
    item?.duenoPorDefecto ?? null,
  );
  const [requiereNumeroSerie, setRequiereNumeroSerie] = useState(
    item?.requiereNumeroSerie ?? false,
  );
  const [nombreError, setNombreError] = useState('');
  const [categoriaError, setCategoriaError] = useState('');
  const [duenoError, setDuenoError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    let valid = true;
    if (!nombre.trim()) {
      setNombreError('Requerido');
      valid = false;
    }
    if (!categoria) {
      setCategoriaError('Requerido');
      valid = false;
    }
    if (!duenoPorDefecto) {
      setDuenoError('Requerido');
      valid = false;
    }
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        nombre: nombre.trim(),
        categoria: categoria!,
        duenoPorDefecto: duenoPorDefecto!,
        requiereNumeroSerie,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer.Content
      title={item ? 'Editar tipo' : 'Nuevo tipo de material'}
      onClose={onClose}
      primaryButtonProps={{
        children: item ? 'Guardar cambios' : 'Crear tipo',
        onClick: handleSubmit,
        loading: submitting,
      }}
      secondaryButtonProps={{
        children: 'Cancelar',
        onClick: onClose,
      }}
    >
      <Stack sx={{ gap: 2.5 }}>
        <InputClassic
          label="Nombre"
          placeholder="Ej: Tablet, Pechera..."
          value={nombre}
          onChange={v => {
            setNombre(v);
            if (nombreError) setNombreError('');
          }}
          error={!!nombreError}
          errorText={nombreError}
          fullWidth
        />
        <Autocomplete
          label="Categoría"
          placeholder="Seleccioná la categoría..."
          options={CATEGORIA_OPTIONS}
          value={CATEGORIA_OPTIONS.find(o => o.value === categoria) ?? null}
          onChange={opt => {
            setCategoria(opt ? opt.value : null);
            if (categoriaError) setCategoriaError('');
          }}
          hasError={!!categoriaError}
          helperText={categoriaError}
        />
        <Autocomplete
          label="Dueño por defecto"
          placeholder="Seleccioná el dueño..."
          options={DUENO_OPTIONS}
          value={DUENO_OPTIONS.find(o => o.value === duenoPorDefecto) ?? null}
          onChange={opt => {
            setDuenoPorDefecto(opt ? opt.value : null);
            if (duenoError) setDuenoError('');
          }}
          hasError={!!duenoError}
          helperText={duenoError}
        />
        <Stack
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Stack>
            <Typography
              variant="body1"
              sx={{ fontWeight: 500 }}
            >
              Requiere número de serie
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Activá si el item necesita número de serie para el seguimiento.
            </Typography>
          </Stack>
          <Toggle
            checked={requiereNumeroSerie}
            onChange={setRequiereNumeroSerie}
          />
        </Stack>
      </Stack>
    </Drawer.Content>
  );
};

export default CatalogItemDrawer;
