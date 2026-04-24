import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  IconAlertTriangle,
  IconArrowLeft,
  IconPencil,
  IconUserMinus,
} from '@material-hu/icons/tabler';
import IconButton from '@material-hu/mui/IconButton';
import Paper from '@material-hu/mui/Paper';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import StateCard from '@material-hu/components/composed-components/StateCard';
import Button from '@material-hu/components/design-system/Buttons/Button';
import InputClassic from '@material-hu/components/design-system/Inputs/Classic';
import { useDialogLayer } from '@material-hu/components/layers/Dialogs';

import { DashboardLayout } from '../../../layouts/DashboardLayout';
import {
  getLifecycleRecord,
  getLifecycleStatus,
} from '../lifecycleStore';

import PersonActions from './components/PersonActions';
import PersonHistorial from './components/PersonHistorial';
import PersonMaterials from './components/PersonMaterials';
import {
  useGetPerson,
  useGetPersonHistory,
  useGetPersonMaterials,
} from './hooks/useGetPerson';
import { usePersonMutations } from './hooks/usePersonMutations';

const PeopleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { person, isLoading } = useGetPerson(id);
  const { materials } = useGetPersonMaterials(person?.nombre);
  const { history } = useGetPersonHistory(person?.nombre);
  const { updateContact } = usePersonMutations(person ?? null);
  const { openDialog, closeDialog } = useDialogLayer();

  const lifecycleStatus = id ? getLifecycleStatus(id) : 'active';
  const lifecycleRecord = id ? getLifecycleRecord(id) : null;

  if (isLoading)
    return (
      <DashboardLayout>
        <div />
      </DashboardLayout>
    );

  if (!person) {
    return (
      <DashboardLayout>
        <StateCard
          slotProps={{
            title: {
              title: 'Persona no encontrada',
              description: 'La persona que buscás no existe.',
              variant: 'M',
            },
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

        {/* ── Lifecycle banner ───────────────────────────────────────────── */}
        {lifecycleStatus === 'pending_recovery' && (
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1.5,
              p: 2,
              borderRadius: 1,
              bgcolor: 'warning.50',
              border: '1px solid',
              borderColor: 'warning.300',
            }}
          >
            <IconUserMinus size={20} color="var(--mui-palette-warning-main)" />
            <Stack sx={{ gap: 0.25, flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.dark' }}>
                Baja en proceso — materiales pendientes de recuperación
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Esta persona ya no aparece en las vistas activas.
                {materials.length > 0
                  ? ` Tiene ${materials.length} ${materials.length === 1 ? 'material' : 'materiales'} por recuperar. Marcalos como recuperados para finalizar la baja.`
                  : ' Todos los materiales fueron recuperados. Podés finalizar la baja.'}
              </Typography>
            </Stack>
          </Stack>
        )}

        {lifecycleStatus === 'terminated' && (
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1.5,
              p: 2,
              borderRadius: 1,
              bgcolor: 'grey.100',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <IconUserMinus size={20} color="var(--mui-palette-text-disabled)" />
            <Stack sx={{ gap: 0.25 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Persona dada de baja
                {lifecycleRecord?.terminatedAt
                  ? ` — ${new Date(lifecycleRecord.terminatedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}`
                  : ''}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Solo visible para auditoría. No aparece en ninguna vista activa.
              </Typography>
            </Stack>
          </Stack>
        )}

        <Stack
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Stack sx={{ gap: 0.5 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700 }}
            >
              {person.nombre}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Responsable de materiales
            </Typography>
          </Stack>
          <PersonActions
            person={person}
            materials={materials}
          />
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Stack sx={{ gap: 3 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: '0.08em', fontWeight: 600 }}
            >
              Información
            </Typography>
            <Stack sx={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
              <ContactField
                label="DNI"
                value={person.dni}
                onEdit={val => updateContact.mutateAsync({ dni: val })}
              />
              <ContactField
                label="Teléfono"
                value={person.telefono}
                onEdit={val => updateContact.mutateAsync({ telefono: val })}
              />
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

// ─── ContactField ──────────────────────────────────────────────────────────────

type ContactFieldProps = {
  label: string;
  value: string;
  onEdit: (val: string) => Promise<void>;
};

const ContactField = ({ label, value, onEdit }: ContactFieldProps) => {
  const { openDialog, closeDialog } = useDialogLayer();
  const isEmpty = !value;

  const handleOpen = () => {
    openDialog({
      content: (
        <EditContactDialog
          label={label}
          initialValue={value}
          onClose={closeDialog}
          onSubmit={async val => {
            await onEdit(val);
            closeDialog();
          }}
        />
      ),
    });
  };

  return (
    <Stack sx={{ gap: 0.25 }}>
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {label}
      </Typography>
      <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 0.5 }}>
        <Typography
          variant="body1"
          color={isEmpty ? 'text.disabled' : 'text.primary'}
        >
          {value || 'Sin completar'}
        </Typography>
        <IconButton
          size="small"
          onClick={handleOpen}
          sx={{ p: 0.25 }}
        >
          <IconPencil size={14} />
        </IconButton>
      </Stack>
    </Stack>
  );
};

type EditContactDialogProps = {
  label: string;
  initialValue: string;
  onClose: () => void;
  onSubmit: (val: string) => Promise<void>;
};

const EditContactDialog = ({
  label,
  initialValue,
  onClose,
  onSubmit,
}: EditContactDialogProps) => {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(value);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack sx={{ p: 3, gap: 3, minWidth: 320 }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 600 }}
      >
        Editar {label.toLowerCase()}
      </Typography>
      <InputClassic
        label={label}
        value={value}
        onChange={setValue}
        fullWidth
        autoFocus
      />
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
          disabled={!value.trim()}
        >
          Guardar
        </Button>
      </Stack>
    </Stack>
  );
};
