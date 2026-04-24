import { useNavigate } from 'react-router-dom';

import Chip from '@material-hu/mui/Chip';
import Stack from '@material-hu/mui/Stack';

import Table from '@material-hu/components/design-system/Table';
import TableBody from '@material-hu/components/design-system/Table/components/TableBody';
import TableCell from '@material-hu/components/design-system/Table/components/TableCell';
import TableContainer from '@material-hu/components/design-system/Table/components/TableContainer';
import TableHead from '@material-hu/components/design-system/Table/components/TableHead';
import TableRow from '@material-hu/components/design-system/Table/components/TableRow';

import { getLifecycleStatus } from '../../../lifecycleStore';
import { type PersonRow } from '../../types';

type PersonsTableProps = {
  persons: PersonRow[];
};

const PersonsTable = ({ persons }: PersonsTableProps) => {
  const navigate = useNavigate();

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 480 }}>
        <TableHead>
          <TableRow headerRow>
            <TableCell headerCell>Nombre</TableCell>
            <TableCell headerCell>DNI</TableCell>
            <TableCell headerCell>Teléfono</TableCell>
            <TableCell headerCell>Materiales</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {persons.map(person => {
            const status = getLifecycleStatus(person.id);
            const onLeave = status === 'on_leave';
            return (
              <TableRow
                key={person.id}
                onClick={() => navigate(`/people/${person.id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Stack
                    sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}
                  >
                    {person.nombre}
                    {onLeave && (
                      <Chip
                        label="licencia"
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ height: 18, fontSize: 10 }}
                      />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>{person.dni || '—'}</TableCell>
                <TableCell>{person.telefono || '—'}</TableCell>
                <TableCell>{person.materialesCount}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PersonsTable;
