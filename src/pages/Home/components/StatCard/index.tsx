import Paper from '@material-hu/mui/Paper';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

type StatCardProps = {
  label: string;
  value: number;
  color?: string;
};

export const StatCard = ({ label, value }: StatCardProps) => {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
      <Stack gap={0.5}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
    </Paper>
  );
};
