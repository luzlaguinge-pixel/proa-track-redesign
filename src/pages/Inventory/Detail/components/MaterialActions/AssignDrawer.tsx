import { memo, useEffect, useMemo, useState } from 'react';

import Fuse from 'fuse.js';
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

// Utility function to normalize strings for search (remove accents, lowercase)
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
};

const AssignDrawerContent = ({
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
  const [debouncedInputValue, setDebouncedInputValue] = useState('');
  const [comodato, setComodato] = useState(material.comodatoFirmado);
  const [observacion, setObservacion] = useState('');
  const [personError, setPersonError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Debounce input changes (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInputValue(inputValue);
    }, 250);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const allOptions = useMemo(
    () =>
      persons.map(p => ({
        label: p.nombre,
        value: p.id,
        description: p.dni ? `DNI ${p.dni}` : undefined,
        searchText: `${p.nombre} ${p.dni || ''}`,
      })),
    [persons],
  );

  // Create Fuse instance for fuzzy search
  const fuse = useMemo(
    () =>
      new Fuse(allOptions, {
        keys: ['label', 'description'],
        threshold: 0.3, // Allow some fuzzy matching
        includeScore: true,
        useExtendedSearch: false,
        isCaseSensitive: false,
        minMatchCharLength: 1,
      }),
    [allOptions],
  );

  const options = useMemo(() => {
    if (!debouncedInputValue.trim()) return allOptions;

    const normalizedSearchTerm = normalizeString(debouncedInputValue.trim());

    // First try exact normalized substring matching for instant results
    const exactMatches = allOptions.filter(o =>
      normalizeString(o.searchText).includes(normalizedSearchTerm),
    );

    // If we have exact matches, return them (up to 15)
    if (exactMatches.length > 0) {
      return exactMatches.slice(0, 15);
    }

    // Otherwise, fall back to fuzzy search
    const fuzzyResults = fuse.search(debouncedInputValue);
    return fuzzyResults.slice(0, 15).map(result => result.item);
  }, [allOptions, debouncedInputValue, fuse]);

  const selectedOption = useMemo(
    () => allOptions.find(o => o.value === selectedPersonId) ?? null,
    [allOptions, selectedPersonId],
  );

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
          placeholder="Buscar por nombre o DNI..."
          options={options}
          value={selectedOption}
          inputValue={inputValue}
          onInputChange={(_e, val) => setInputValue(val)}
          virtualized
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

const AssignDrawer = memo(AssignDrawerContent);

export default AssignDrawer;
