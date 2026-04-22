import Stack from '@material-hu/mui/Stack';

import Button from '@material-hu/components/design-system/Buttons/Button';

import { type Country } from '../../hooks/useCountryFilter';

const OPTIONS: { value: Country; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'AR', label: 'Argentina' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'GT', label: 'Guatemala' },
];

type CountryToggleProps = {
  value: Country;
  onChange: (c: Country) => void;
};

export const CountryToggle = ({ value, onChange }: CountryToggleProps) => (
  <Stack sx={{ flexDirection: 'row', gap: 1, flexWrap: 'wrap' }}>
    {OPTIONS.map(opt => (
      <Button
        key={opt.value}
        variant={value === opt.value ? 'secondary' : 'tertiary'}
        size="small"
        onClick={() => onChange(opt.value)}
      >
        {opt.label}
      </Button>
    ))}
  </Stack>
);
