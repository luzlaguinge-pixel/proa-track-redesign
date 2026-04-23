import { useState, useMemo } from 'react';

import { IconShield } from '@material-hu/icons/tabler';
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
import InputClassic from '@material-hu/components/design-system/Inputs/Classic';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { useAuth } from '../../../providers/AuthContext';
import { type Perfil, useProfile } from '../../../providers/ProfileContext';
import { getActivePeople } from '../../../services/people';
import { getAllStoredRoles, SEED_ADMINS } from '../../../stores/roleStore';
import { getTeamForLeader, setTeamForLeader } from '../../../stores/teamStore';
import { SendNotificationDrawer } from './components/SendNotificationDrawer';

const ROLE_LABELS: Record<Perfil, string> = {
  admin: 'Admin',
  coordinador: 'Coordinador/a Regional',
  navegante: 'Navegante',
};

const ROLE_OPTIONS: Perfil[] = ['admin', 'coordinador', 'navegante'];

const RoleManagement = () => {
  const { user } = useAuth();
  const { perfil, assignRole } = useProfile();
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roles, setRoles] = useState<Record<string, Perfil>>(() => getAllStoredRoles());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCoordinadorDni, setSelectedCoordinadorDni] = useState<string>('');
  const [coordinadorTeamSelection, setCoordinadorTeamSelection] = useState<Set<string>>(new Set());
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  const { data: rawPeople = [], isLoading } = useQuery({
    queryKey: ['people-for-roles'],
    queryFn: getActivePeople,
  });

  const people = useMemo(() => {
    if (!user || !user.employeeInternalId) return rawPeople;
    const exists = rawPeople.some(p => p.dni === user.employeeInternalId);
    if (exists) return rawPeople;
    return [
      {
        id: String(user.id),
        nombre: `${user.firstName} ${user.lastName}`.trim(),
        dni: user.employeeInternalId,
        email: user.email,
      },
      ...rawPeople,
    ];
  }, [rawPeople, user]);

  if (perfil !== 'admin' && perfil !== 'coordinador') {
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


  const handleOpenCreateTeamDrawer = () => {
    setSelectedCoordinadorDni('');
    setCoordinadorTeamSelection(new Set());
    setDrawerOpen(true);
  };

  const handleSelectCoordinador = (coordinadorDni: string) => {
    setSelectedCoordinadorDni(coordinadorDni);
    setCoordinadorTeamSelection(new Set(getTeamForLeader(coordinadorDni)));
  };

  const handleToggleCoordinadorTeamMember = (dni: string) => {
    setCoordinadorTeamSelection(prev => {
      const next = new Set(prev);
      if (next.has(dni)) next.delete(dni);
      else next.add(dni);
      return next;
    });
  };

  const handleSaveCoordinadorTeam = () => {
    if (!selectedCoordinadorDni) return;
    setTeamForLeader(selectedCoordinadorDni, Array.from(coordinadorTeamSelection));
    setSnackbar('Equipo del coordinador/a guardado correctamente.');
    setDrawerOpen(false);
  };

  const filteredPeople = useMemo(() => {
    if (!searchTerm.trim()) return people;
    const q = searchTerm.toLowerCase();
    return people.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.dni.toLowerCase().includes(q)
    );
  }, [searchTerm, people]);

  const navegantes = people.filter(p => getEffectiveRole(p.dni) === 'navegante');
  const coordinadores = people.filter(p => getEffectiveRole(p.dni) === 'coordinador');
  const selectedCoordinador = coordinadores.find(c => c.dni === selectedCoordinadorDni);

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
              <Stack sx={{ gap: 3 }}>
                <InputClassic
                  placeholder="Buscar por nombre o DNI..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  fullWidth
                />

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
                    minWidth: 500,
                    overflowX: 'auto',
                  }}
                >
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ flex: 1 }}>NOMBRE</Typography>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ width: 200 }}>USUARIO / DNI</Typography>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ width: 160 }}>ROL</Typography>
                </Stack>

                {filteredPeople.map((person, idx) => {
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
                        minWidth: 500,
                        overflowX: 'auto',
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
              </Stack>
            )}
          </Stack>
        )}

        {/* Assign teams to coordinators */}
        {coordinadores.length > 0 && (
          <Stack sx={{ gap: 3 }}>
            <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Title
                title="Equipos de coordinadores/as regionales"
                description="Asignà los navegantes que conforman el equipo de cada coordinador/a regional."
                variant={perfil === 'coordinador' ? 'L' : 'M'}
              />
              <Stack sx={{ flexDirection: 'row', gap: 2 }}>
                {perfil === 'admin' && (
                  <Button
                    variant="secondary"
                    size="medium"
                    onClick={() => setNotificationDrawerOpen(true)}
                  >
                    Enviar notificación
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleOpenCreateTeamDrawer}
                >
                  Crear equipo
                </Button>
              </Stack>
            </Stack>
          </Stack>
        )}

        {/* Create/Edit team drawer */}
        {drawerOpen && coordinadores.length > 0 && (
          <Stack
            sx={{
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100%',
              width: { xs: '100%', sm: 480 },
              bgcolor: 'background.paper',
              boxShadow: 3,
              zIndex: 1300,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Stack sx={{ p: 3, gap: 3, flex: 1, overflowY: 'auto' }}>
              <Stack sx={{ gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Crear equipo
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Seleccioná un coordinador/a regional y los navegantes que conforman su equipo.
                </Typography>
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <Typography variant="body2" fontWeight={500} color="text.secondary">
                  Seleccionar coordinador/a regional
                </Typography>
                <Stack sx={{ flexWrap: 'wrap', flexDirection: 'row', gap: 1 }}>
                  {coordinadores.map(coordinador => (
                    <Chip
                      key={coordinador.id}
                      label={coordinador.nombre}
                      onClick={() => handleSelectCoordinador(coordinador.dni)}
                      color={selectedCoordinadorDni === coordinador.dni ? 'primary' : 'default'}
                      variant={selectedCoordinadorDni === coordinador.dni ? 'filled' : 'outlined'}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </Stack>

              {selectedCoordinadorDni && (
                <Stack sx={{ gap: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    Equipo de {selectedCoordinador?.nombre}
                  </Typography>
                  {navegantes.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">
                      No hay navegantes disponibles
                    </Typography>
                  ) : (
                    <Stack sx={{ flexWrap: 'wrap', flexDirection: 'row', gap: 1 }}>
                      {navegantes.map(person => {
                        const selected = coordinadorTeamSelection.has(person.dni);
                        return (
                          <Chip
                            key={person.id}
                            label={person.nombre}
                            onClick={() => handleToggleCoordinadorTeamMember(person.dni)}
                            color={selected ? 'primary' : 'default'}
                            variant={selected ? 'filled' : 'outlined'}
                            sx={{ cursor: 'pointer' }}
                          />
                        );
                      })}
                    </Stack>
                  )}
                </Stack>
              )}
            </Stack>

            <Stack
              sx={{
                flexDirection: 'row',
                gap: 1,
                justifyContent: 'flex-end',
                p: 3,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Button
                variant="tertiary"
                size="medium"
                onClick={() => setDrawerOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="medium"
                onClick={handleSaveCoordinadorTeam}
                disabled={!selectedCoordinadorDni}
              >
                Guardar equipo
              </Button>
            </Stack>
          </Stack>
        )}

        {/* Send notification drawer */}
        <SendNotificationDrawer
          open={notificationDrawerOpen}
          onClose={() => setNotificationDrawerOpen(false)}
          people={people}
          onSuccess={(message) => {
            setSnackbar(message);
            setNotificationDrawerOpen(false);
          }}
          onError={(message) => setSnackbar(message)}
        />

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
      </Stack>

    </DashboardLayout>
  );
};

export default RoleManagement;
