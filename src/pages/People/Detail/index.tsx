import { useNavigate, useParams } from 'react-router-dom';

import Paper from '@material-hu/mui/Paper';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import StateCard from '@material-hu/components/composed-components/StateCard';
import Button from '@material-hu/components/design-system/Buttons/Button';
import { IconAlertTriangle, IconArrowLeft } from '@material-hu/icons/tabler';

import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { useGetPerson, useGetPersonHistory, useGetPersonMaterials } from './hooks/useGetPerson';
import PersonActions from './components/PersonActions';
import PersonHistorial from './components/PersonHistorial';
import PersonMaterials from './components/PersonMaterials';

const PeopleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { person, isLoading } = useGetPerson(id);
  const { materials } = useGetPersonMaterials(person?.nombre);
  const { history } = useGetPersonHistory(person?.nombre);

  if (isLoading) return <DashboardLayout><div /></DashboardLayout>;

  if (!person) {
    return (
      <DashboardLayout>
        <StateCard
          slotProps={{
            title: { title: 'Persona no encontrada', description: 'La persona que buscás no existe.', variant: 'M' },
            avatar: { Icon: IconAlertTriangle, color: 'default' },
          }}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Stack sx={{ gap: 4 }}>
        <Button
          variant="tertiary"
          size="small"
          startIcon={<IconArrowLeft size={16} />}
          onClick={() => navigate('/people')}
          sx={{ alignSelf: 'flex-start' }}
        >
          Volver a personas
        </Button>

        <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Stack sx={{ gap: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{person.nombre}</Typography>
            <Typography variant="body2" color="text.secondary">Responsable de materiales</Typography>
          </Stack>
          <PersonActions person={person} materials={materials} />
        </Stack>

        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, bgcolor: 'background.paper' }}>
          <Stack sx={{ gap: 3 }}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.08em', fontWeight: 600 }}>
              Información
            </Typography>
            <Stack sx={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
              <Stack sx={{ gap: 0.25 }}>
                <Typography variant="caption" color="text.secondary">DNI</Typography>
                <Typography variant="body1">{person.dni || '—'}</Typography>
              </Stack>
              <Stack sx={{ gap: 0.25 }}>
                <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                <Typography variant="body1">{person.telefono || '—'}</Typography>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <PersonMaterials materials={materials} />
        <PersonHistorial history={history} />
      </Stack>
    </DashboardLayout>
  );
};

export default PeopleDetail;
