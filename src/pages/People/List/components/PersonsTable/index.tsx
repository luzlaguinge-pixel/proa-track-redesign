import { useNavigate } from 'react-router-dom';

import Table from '@material-hu/components/design-system/Table';
import TableBody from '@material-hu/components/design-system/Table/components/TableBody';
import TableCell from '@material-hu/components/design-system/Table/components/TableCell';
import TableContainer from '@material-hu/components/design-system/Table/components/TableContainer';
import TableHead from '@material-hu/components/design-system/Table/components/TableHead';
import TableRow from '@material-hu/components/design-system/Table/components/TableRow';

import { type PersonRow } from '../../types';

type PersonsTableProps = {
  persons: PersonRow[];
};

const PersonsTable = ({ persons }: PersonsTableProps) => {
  const navigate = useNavigate();

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow headerRow>
            <TableCell headerCell>Nombre</TableCell>
            <TableCell headerCell>DNI</TableCell>
            <TableCell headerCell>Teléfono</TableCell>
            <TableCell headerCell>Materiales</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {persons.map(person => (
            <TableRow
              key={person.id}
              onClick={() => navigate(`/people/${person.id}`)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>{person.nombre}</TableCell>
              <TableCell>{person.dni || '—'}</TableCell>
              <TableCell>{person.telefono || '—'}</TableCell>
              <TableCell>{person.materialesCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PersonsTable;
