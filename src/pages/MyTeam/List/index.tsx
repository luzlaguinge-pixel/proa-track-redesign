import { useNavigate } from 'react-router-dom';

import {
  IconBox,
  IconInfoCircle,
  IconMail,
  IconPhone,
} from '@material-hu/icons/tabler';
import Box from '@material-hu/mui/Box';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import StateCard from '@material-hu/components/composed-components/StateCard';
import Search from '@material-hu/components/design-system/Inputs/Search';
import Table from '@material-hu/components/design-system/Table';
import TableBody from '@material-hu/components/design-system/Table/components/TableBody';
import TableCell from '@material-hu/components/design-system/Table/components/TableCell';
import TableContainer from '@material-hu/components/design-system/Table/components/TableContainer';
import TableHead from '@material-hu/components/design-system/Table/components/TableHead';
import TableRow from '@material-hu/components/design-system/Table/components/TableRow';
import Title from '@material-hu/components/design-system/Title';

import { useAuth } from '../../../providers/AuthContext';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { useMyTeam } from './hooks/useMyTeam';

const PAIS_LABEL: Record<string, string> = {
  AR: 'Argentina',
  GT: 'Guatemala',
  UY: 'Uruguay',
};

const MyTeamList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { members, total, isLoading, search, setSearch } = useMyTeam();
  const leaderNombre = user ? `${user.firstName} ${user.lastName}`.trim() : '';

  if (isLoading) return <DashboardLayout><div /></DashboardLayout>;

  return (
    <DashboardLayout>
      <Stack sx={{ gap: 3 }}>
        <Stack sx={{ gap: 1 }}>
          <Title
            title="Mi equipo"
            description={`Equipo de ${leaderNombre} · ${total} personas`}
            variant="L"
          />
        </Stack>

        <Search
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre, puesto o email"
          variant="classic"
        />

        {members.length === 0 ? (
          <StateCard
            slotProps={{
              title: {
                title: search ? 'Sin resultados' : 'Sin integrantes',
                description: search
                  ? 'Probá con otro nombre o puesto.'
                  : 'No hay personas con este líder directo.',
                variant: 'M',
              },
              avatar: { Icon: IconInfoCircle, color: 'default' },
            }}
          />
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow headerRow>
                  <TableCell headerCell>Persona</TableCell>
                  <TableCell headerCell>Puesto</TableCell>
                  <TableCell headerCell>Contacto</TableCell>
                  <TableCell headerCell>País</TableCell>
                  <TableCell headerCell>Materiales</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map(member => (
                  <TableRow
                    key={member.id}
                    onClick={() => navigate(`/people/${member.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Stack sx={{ gap: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {member.nombre}
                        </Typography>
                        {member.dni && (
                          <Typography variant="caption" color="text.secondary">
                            DNI {member.dni}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {member.puesto || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack sx={{ gap: 0.5 }}>
                        {member.email && (
                          <Stack
                            sx={{
                              flexDirection: 'row',
                              gap: 0.5,
                              alignItems: 'center',
                            }}
                          >
                            <IconMail size={14} />
                            <Typography variant="caption" noWrap>
                              {member.email}
                            </Typography>
                          </Stack>
                        )}
                        {member.telefono && (
                          <Stack
                            sx={{
                              flexDirection: 'row',
                              gap: 0.5,
                              alignItems: 'center',
                            }}
                          >
                            <IconPhone size={14} />
                            <Typography variant="caption">
                              {member.telefono}
                            </Typography>
                          </Stack>
                        )}
                        {!member.email && !member.telefono && (
                          <Typography variant="caption" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {PAIS_LABEL[member.pais] ?? member.pais}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack
                        sx={{
                          flexDirection: 'row',
                          gap: 0.5,
                          alignItems: 'center',
                        }}
                      >
                        {member.materialesCount > 0 && (
                          <Box sx={{ color: 'primary.main', display: 'flex' }}>
                            <IconBox size={14} />
                          </Box>
                        )}
                        <Typography
                          variant="body2"
                          color={
                            member.materialesCount > 0
                              ? 'text.primary'
                              : 'text.disabled'
                          }
                        >
                          {member.materialesCount}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    </DashboardLayout>
  );
};

export default MyTeamList;
