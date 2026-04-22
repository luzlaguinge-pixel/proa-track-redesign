import { useState } from 'react';

import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Drawer from '@material-hu/components/design-system/Drawer';
import Autocomplete from '@material-hu/components/design-system/Inputs/Autocomplete';
import InputClassic from '@material-hu/components/design-system/Inputs/Classic';
import Toggle from '@material-hu/components/design-system/Toggle';

import { type Material } from '../../../List/types';
import { type Person } from '../../types';

type AssignDrawerProps = {
  material: Material;
  persons: Person[];
  onClose: () => void;
  onSubmit: (input: {
    personId: string;
    comodato: boolean;
    observacion: string;
  }) => Promise<void> | void;
};

const AssignDrawer = ({
  material,
  persons,
  onClose,
  onSubmit,
}: AssignDrawerProps) => {
  const hasResponsable = !!material.responsableNombre;
  const currentPerson = persons.find(
    p => p.nombre === material.responsableNombre,
  );

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(
    currentPerson?.id ?? null,
  );
  const [inputValue, setInputValue] = useState('');
  const [comodato, setComodato] = useState(material.comodatoFirmado);
  const [observacion, setObservacion] = useState('');
  const [personError, setPersonError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const allOptions = persons.map(p => ({
    label: p.nombre,
    value: p.id,
    description: p.dni ? `DNI ${p.dni}` : undefined,
  }));

  const options = inputValue.trim()
    ? allOptions.filter(o =>
        o.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        (o.description ?? '').toLowerCase().includes(inputValue.toLowerCase()),
      )
    : allOptions.slice(0, 50);

  const selectedOption =
    allOptions.find(o => o.value === selectedPersonId) ?? null;

  const handleSubmit = async () => {
    if (!selectedPersonId) {
      setPersonError(true);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ personId: selectedPersonId, comodato, observacion });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer.Content
      title={hasResponsable ? 'Reasignar material' : 'Asignar material'}
      onClose={onClose}
      primaryButtonProps={{
        children: hasResponsable ? 'Reasignar' : 'Asignar',
        onClick: handleSubmit,
        loading: submitting,
      }}
      secondaryButtonProps={{
        children: 'Cancelar',
        onClick: onClose,
        disabled: submitting,
      }}
    >
      <Stack sx={{ gap: 3 }}>
        <Autocomplete
          label="Persona"
          placeholder="Buscar persona..."
          options={options}
          value={selectedOption}
          inputValue={inputValue}
          onInputChange={(_e, val) => setInputValue(val)}
          isServerFiltered
          onChange={value => {
            setSelectedPersonId(value ? String(value.value) : null);
            setPersonError(false);
          }}
          hasError={personError}
          helperText={personError ? 'Seleccioná una persona' : undefined}
        />
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
              Comodato firmado
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Marcá si la persona firmó el comodato de uso.
            </Typography>
          </Stack>
          <Toggle
            checked={comodato}
            onChange={setComodato}
          />
        </Stack>
        <InputClassic
          label="Observaciones"
          placeholder="Notas adicionales (opcional)"
          multiline
          minRows={3}
          maxRows={6}
          value={observacion}
          onChange={setObservacion}
          fullWidth
        />
      </Stack>
    </Drawer.Content>
  );
};

export default AssignDrawer;
