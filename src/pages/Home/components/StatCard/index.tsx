import Paper from '@material-hu/mui/Paper';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

type StatCardProps = {
  label: string;
  value: number;
  subtitle?: string;
  color?: 'default' | 'error' | 'warning';
  showTrend?: boolean;
};

export const StatCard = ({
  label,
  value,
  subtitle,
  color,
  showTrend,
}: StatCardProps) => {
  const valueColor =
    color === 'error' && value > 0
      ? 'error.main'
      : color === 'warning' && value > 0
        ? 'warning.main'
        : 'text.primary';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: 'background.paper',
        flex: '1 1 140px',
        minWidth: 120,
      }}
    >
      <Stack gap={0.5}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: valueColor }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {label}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {subtitle}
          </Typography>
        )}
        {showTrend && (
          <Typography
            variant="caption"
            color="text.disabled"
          >
            — vs. mes pasado
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};
