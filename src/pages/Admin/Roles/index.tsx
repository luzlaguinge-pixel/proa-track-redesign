import { useState } from 'react';

import { IconShield, IconUsersGroup } from '@material-hu/icons/tabler';
import Alert from '@material-hu/mui/Alert';
import Chip from '@material-hu/mui/Chip';
import MenuItem from '@material-hu/mui/MenuItem';
import Select from '@material-hu/mui/Select';
import Snackbar from '@material-hu/mui/Snackbar';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import StateCard from '@material-hu/components/composed-components/StateCard';
import Button from '@material-hu/components/design-system/Buttons/Button';
import Title from '@material-hu/components/design-system/Title';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { useAuth } from '../../../providers/AuthContext';
import { type Perfil, useProfile } from '../../../providers/ProfileContext';
import { getActivePeople } from '../../../services/people';
import { getAllStoredRoles, getRoleForId, SEED_ADMINS } from '../../../stores/roleStore';
import { getTeamForLeader, setTeamForLeader } from '../../../stores/teamStore';

const ROLE_LABELS: Record<Perfil, string> = {
  admin: 'Admin',
  lider: 'Líder',
  navegante: 'Navegante',
};

const ROLE_OPTIONS: Perfil[] = ['admin', 'lider', 'navegante'];

const RoleManagement = () => {
  const { user } = useAuth();
  const { perfil, assignRole } = useProfile();
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState('');
  const [roles, setRoles] = useState<Record<string, Perfil>>(() => getAllStoredRoles());
  const [teamSelection, setTeamSelection] = useState<Set<string>>(
    () => new Set(user ? getTeamForLeader(user.employeeInternalId) : []),
  );

  const { data: people = [], isLoading } = useQuery({
    queryKey: ['people-for-roles'],
    queryFn: getActivePeople,
  });

  if (perfil !== 'admin' && perfil !== 'lider') {
    return (
      <DashboardLayout>
        <StateCard
          slotProps={{
            title: { title: 'Acceso restringido', description: 'No tenés permisos para ver esta sección.', variant: 'M' },
            avatar: { Icon: IconShield, color: 'default' },
          }}
        />
      </DashboardLayout>
    );
  }

  const getEffectiveRole = (employeeInternalId: string): Perfil => {
    if (SEED_ADMINS.has(employeeInternalId)) return 'admin';
    return roles[employeeInternalId] ?? 'navegante';
  };

  const handleChangeRole = (employeeInternalId: string, newRole: Perfil) => {
    if (SEED_ADMINS.has(employeeInternalId)) return;
    assignRole(employeeInternalId, newRole);
    setRoles(prev => ({ ...prev, [employeeInternalId]: newRole }));
    void queryClient.invalidateQueries({ queryKey: ['persons'] });
    setSnackbar('Rol actualizado correctamente.');
  };

  const handleToggleTeamMember = (dni: string) => {
    setTeamSelection(prev => {
      const next = new Set(prev);
      if (next.has(dni)) next.delete(dni);
      else next.add(dni);
      return next;
    });
  };

  const handleSaveTeam = () => {
    if (!user) return;
    setTeamForLeader(user.employeeInternalId, Array.from(teamSelection));
    setSnackbar('Equipo guardado correctamente.');
  };

  const navegantes = people.filter(p => getEffectiveRole(p.dni) === 'navegante');

  return (
    <DashboardLayout>
      <Stack sx={{ gap: 4 }}>

        {/* Admin section: role assignment */}
        {perfil === 'admin' && (
          <Stack sx={{ gap: 3 }}>
            <Title
              title="Gestión de roles"
              description="Asigná roles a los integrantes del equipo."
              variant="L"
            />

            {isLoading ? (
              <Typography color="text.secondary">Cargando personas...</Typography>
            ) : (
              <Stack sx={{ overflowX: 'auto' }}>
                <Stack
                  sx={{
                    flexDirection: 'row',
                    px: 2,
                    py: 1,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '8px 8px 0 0',
                    minWidth: 520,
                  }}
                >
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ flex: 1 }}>NOMBRE</Typography>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ width: 200 }}>USUARIO / DNI</Typography>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ width: 160 }}>ROL</Typography>
                </Stack>

                {people.map((person, idx) => {
                  const currentRole = getEffectiveRole(person.dni);
                  const locked = SEED_ADMINS.has(person.dni);
                  const isCurrentUser = user?.employeeInternalId === person.dni;

                  return (
                    <Stack
                      key={person.id}
                      sx={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        px: 2,
                        py: 1,
                        bgcolor: isCurrentUser ? 'action.hover' : 'background.paper',
                        border: '1px solid',
                        borderTop: 'none',
                        borderColor: 'divider',
                        minWidth: 520,
                        ...(idx === people.length - 1 && { borderRadius: '0 0 8px 8px' }),
                      }}
                    >
                      <Stack sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {person.nombre}
                          {isCurrentUser && (
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>(vos)</Typography>
                          )}
                        </Typography>
                      </Stack>

                      <Typography variant="body2" color="text.secondary" sx={{ width: 200 }}>
                        {person.dni}
                      </Typography>

                      <Stack sx={{ width: 160 }}>
                        {locked ? (
                          <Chip
                            label="Admin permanente"
                            size="small"
                            color="error"
                            variant="filled"
                          />
                        ) : (
                          <Select
                            size="small"
                            value={currentRole}
                            onChange={e => handleChangeRole(person.dni, e.target.value as Perfil)}
                            sx={{ fontSize: 13 }}
                          >
                            {ROLE_OPTIONS.map(role => (
                              <MenuItem key={role} value={role} sx={{ fontSize: 13 }}>
                                {ROLE_LABELS[role]}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Stack>
        )}

        {/* Leader section: build their team */}
        <Stack sx={{ gap: 3 }}>
          <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Title
              title="Mi equipo"
              description="Seleccioná los navegantes que conforman tu equipo."
              variant={perfil === 'lider' ? 'L' : 'M'}
            />
            <Button variant="primary" size="large" startIcon={<IconUsersGroup size={18} />} onClick={handleSaveTeam} sx={{ flexShrink: 0 }}>
              Guardar equipo
            </Button>
          </Stack>

          {isLoading ? (
            <Typography color="text.secondary">Cargando navegantes...</Typography>
          ) : navegantes.length === 0 ? (
            <StateCard
              slotProps={{
                title: { title: 'No hay navegantes disponibles', description: 'Primero asigná el rol de Navegante a algunos usuarios.', variant: 'M' },
                avatar: { Icon: IconUsersGroup, color: 'default' },
              }}
            />
          ) : (
            <Stack sx={{ flexWrap: 'wrap', flexDirection: 'row', gap: 1 }}>
              {navegantes.map(person => {
                const selected = teamSelection.has(person.dni);
                return (
                  <Chip
                    key={person.id}
                    label={person.nombre}
                    onClick={() => handleToggleTeamMember(person.dni)}
                    color={selected ? 'primary' : 'default'}
                    variant={selected ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                );
              })}
            </Stack>
          )}
        </Stack>

      </Stack>

      <Snackbar
        open={!!snackbar}
        onClose={() => setSnackbar('')}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSnackbar('')}>
          {snackbar}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default RoleManagement;
