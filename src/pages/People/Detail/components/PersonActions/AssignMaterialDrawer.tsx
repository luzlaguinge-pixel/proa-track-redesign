import { useState } from 'react';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';
import Drawer from '@material-hu/components/design-system/Drawer';
import Autocomplete from '@material-hu/components/design-system/Inputs/Autocomplete';
import Toggle from '@material-hu/components/design-system/Toggle';
import InputClassic from '@material-hu/components/design-system/Inputs/Classic';
import { TIPO_LABEL } from '../../../../Inventory/List/constants';
import type { Material } from '../../../../Inventory/List/types';

type AssignMaterialDrawerProps = {
  availableMaterials: Material[];
  personNombre: string;
  onClose: () => void;
  onSubmit: (input: { material: Material; comodato: boolean; observacion: string }) => Promise<void> | void;
};

const AssignMaterialDrawer = ({ availableMaterials, personNombre, onClose, onSubmit }: AssignMaterialDrawerProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comodato, setComodato] = useState(false);
  const [observacion, setObservacion] = useState('');
  const [materialError, setMaterialError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const options = availableMaterials.map(m => ({
    label: `${TIPO_LABEL[m.tipo]} · ${m.detalle || '—'} · ${m.osc}`,
    value: m.id,
  }));
  const selectedOption = options.find(o => o.value === selectedId) ?? null;

  const handleSubmit = async () => {
    if (!selectedId) { setMaterialError(true); return; }
    const material = availableMaterials.find(m => m.id === selectedId);
    if (!material) return;
    setSubmitting(true);
    try {
      await onSubmit({ material, comodato, observacion });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer.Content
      title={`Asignar material a ${personNombre}`}
      onClose={onClose}
      primaryButtonProps={{ children: 'Asignar', onClick: handleSubmit, loading: submitting }}
      secondaryButtonProps={{ children: 'Cancelar', onClick: onClose, disabled: submitting }}
    >
      <Stack sx={{ gap: 3 }}>
        <Autocomplete
          label="Material disponible"
          placeholder="Buscar material..."
          options={options}
          value={selectedOption}
          onChange={opt => { setSelectedId(opt ? String(opt.value) : null); setMaterialError(false); }}
          hasError={materialError}
          helperText={materialError ? 'Seleccioná un material' : undefined}
        />
        <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Stack sx={{ gap: 0.25 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>Comodato firmado</Typography>
            <Typography variant="caption" color="text.secondary">Marcá si la persona firmó el comodato.</Typography>
          </Stack>
          <Toggle checked={comodato} onChange={setComodato} />
        </Stack>
        <InputClassic
          label="Observaciones (opcional)"
          placeholder="Notas adicionales..."
          multiline minRows={3} maxRows={6}
          value={observacion}
          onChange={setObservacion}
          fullWidth
        />
      </Stack>
    </Drawer.Content>
  );
};

export default AssignMaterialDrawer;
