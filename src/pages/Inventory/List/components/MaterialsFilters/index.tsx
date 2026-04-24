import Stack from '@material-hu/mui/Stack';

import Button from '@material-hu/components/design-system/Buttons/Button';
import Search from '@material-hu/components/design-system/Inputs/Search';
import Select from '@material-hu/components/design-system/Inputs/Select';

import { DUEÑO_LABEL, ESTADO_CONFIG, TIPO_LABEL } from '../../constants';
import {
  type Disponibilidad,
  type Filters,
} from '../../hooks/useMaterialsFilters';
import {
  type MaterialDueño,
  type MaterialEstado,
  type MaterialTipo,
} from '../../types';

const disponibilidadOptions: { value: Disponibilidad; label: string }[] = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'no_disponible', label: 'No disponible' },
];

type MaterialsFiltersProps = {
  filters: Filters;
  oscOptions: string[];
  plazaOptions: string[];
  hasActiveFilters: boolean;
  onUpdate: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onClear: () => void;
};

const tipoOptions = (Object.keys(TIPO_LABEL) as MaterialTipo[]).map(value => ({
  value,
  label: TIPO_LABEL[value],
}));

const estadoOptions = (Object.keys(ESTADO_CONFIG) as MaterialEstado[]).map(
  value => ({
    value,
    label: ESTADO_CONFIG[value].label,
  }),
);

const dueñoOptions = (Object.keys(DUEÑO_LABEL) as MaterialDueño[]).map(
  value => ({
    value,
    label: DUEÑO_LABEL[value],
  }),
);

const MaterialsFilters = ({
  filters,
  oscOptions,
  plazaOptions,
  hasActiveFilters,
  onUpdate,
  onClear,
}: MaterialsFiltersProps) => {
  return (
    <Stack
      sx={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
      }}
    >
      <Stack sx={{ flex: '1 1 240px', minWidth: 200 }}>
        <Search
          value={filters.search}
          onChange={value => onUpdate('search', value)}
          placeholder="Buscar por responsable, detalle, observaciones…"
          variant="classic"
        />
      </Stack>
      <Stack sx={{ minWidth: 140 }}>
        <Select
          value={filters.tipo}
          onChange={value => onUpdate('tipo', value as MaterialTipo | '')}
          options={tipoOptions}
          placeholder="Tipo"
          allowClear
        />
      </Stack>
      <Stack sx={{ minWidth: 140 }}>
        <Select
          value={filters.disponibilidad}
          onChange={value =>
            onUpdate('disponibilidad', value as Disponibilidad | '')
          }
          options={disponibilidadOptions}
          placeholder="Disponibilidad"
          allowClear
        />
      </Stack>
      <Stack sx={{ minWidth: 140 }}>
        <Select
          value={filters.estado}
          onChange={value => onUpdate('estado', value as MaterialEstado | '')}
          options={estadoOptions}
          placeholder="Estado"
          allowClear
        />
      </Stack>
      <Stack sx={{ minWidth: 140 }}>
        <Select
          value={filters.dueño}
          onChange={value => onUpdate('dueño', value as MaterialDueño | '')}
          options={dueñoOptions}
          placeholder="Dueño"
          allowClear
        />
      </Stack>
      <Stack sx={{ minWidth: 140 }}>
        <Select
          value={filters.osc}
          onChange={value => onUpdate('osc', value)}
          options={oscOptions.map(o => ({ value: o, label: o }))}
          placeholder="OSC"
          allowClear
        />
      </Stack>
      <Stack sx={{ minWidth: 140 }}>
        <Select
          value={filters.plaza}
          onChange={value => onUpdate('plaza', value)}
          options={plazaOptions.map(p => ({ value: p, label: p }))}
          placeholder="Plaza"
          allowClear
        />
      </Stack>
      {hasActiveFilters && (
        <Button
          variant="text"
          onClick={onClear}
        >
          Limpiar filtros
        </Button>
      )}
    </Stack>
  );
};

export default MaterialsFilters;
