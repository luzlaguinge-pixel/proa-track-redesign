import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Stack from '@material-hu/mui/Stack';

import Pagination from '@material-hu/components/design-system/Inputs/Pagination';
import Pills from '@material-hu/components/design-system/Pills';
import Table from '@material-hu/components/design-system/Table';
import TableBody from '@material-hu/components/design-system/Table/components/TableBody';
import TableCell from '@material-hu/components/design-system/Table/components/TableCell';
import TableContainer from '@material-hu/components/design-system/Table/components/TableContainer';
import TableHead from '@material-hu/components/design-system/Table/components/TableHead';
import TableRow from '@material-hu/components/design-system/Table/components/TableRow';

import {
  DUEÑO_LABEL,
  ESTADO_CONFIG,
  PAGE_LIMIT_OPTIONS,
  TIPO_LABEL,
} from '../../constants';
import { type Material } from '../../types';

type MaterialsTableProps = {
  materials: Material[];
};

const MaterialsTable = ({ materials }: MaterialsTableProps) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const totalPages = Math.max(1, Math.ceil(materials.length / limit));
  const paginated = useMemo(
    () => materials.slice((page - 1) * limit, page * limit),
    [materials, page, limit],
  );

  return (
    <Stack sx={{ gap: 2 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow headerRow>
              <TableCell headerCell>Tipo</TableCell>
              <TableCell headerCell>Detalle</TableCell>
              <TableCell headerCell>Estado</TableCell>
              <TableCell headerCell>Dueño</TableCell>
              <TableCell headerCell>OSC</TableCell>
              <TableCell headerCell>Plaza</TableCell>
              <TableCell headerCell>Responsable</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map(material => {
              const estado = ESTADO_CONFIG[material.estado];
              return (
                <TableRow
                  key={material.id}
                  onClick={() => navigate(`/inventory/${material.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{TIPO_LABEL[material.tipo]}</TableCell>
                  <TableCell>{material.detalle || '—'}</TableCell>
                  <TableCell>
                    <Pills
                      label={estado.label}
                      type={estado.type}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{DUEÑO_LABEL[material.dueño]}</TableCell>
                  <TableCell>{material.osc || '—'}</TableCell>
                  <TableCell>{material.plaza}</TableCell>
                  <TableCell>{material.responsableNombre ?? '—'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        type="changer"
        page={page}
        totalPages={totalPages}
        limit={limit}
        limitOptions={PAGE_LIMIT_OPTIONS}
        onChangePage={setPage}
        onChangeLimit={newLimit => {
          setLimit(newLimit);
          setPage(1);
        }}
      />
    </Stack>
  );
};

export default MaterialsTable;
