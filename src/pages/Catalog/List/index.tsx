import {
  IconArchive,
  IconDotsVertical,
  IconEdit,
  IconInfoCircle,
  IconPlus,
} from '@material-hu/icons/tabler';
import IconButton from '@material-hu/mui/IconButton';
import Paper from '@material-hu/mui/Paper';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import StateCard from '@material-hu/components/composed-components/StateCard';
import Button from '@material-hu/components/design-system/Buttons/Button';
import Pills from '@material-hu/components/design-system/Pills';
import Table from '@material-hu/components/design-system/Table';
import TableBody from '@material-hu/components/design-system/Table/components/TableBody';
import TableCell from '@material-hu/components/design-system/Table/components/TableCell';
import TableContainer from '@material-hu/components/design-system/Table/components/TableContainer';
import TableHead from '@material-hu/components/design-system/Table/components/TableHead';
import TableRow from '@material-hu/components/design-system/Table/components/TableRow';
import Title from '@material-hu/components/design-system/Title';
import { useDialogLayer } from '@material-hu/components/layers/Dialogs';
import { useDrawerLayer } from '@material-hu/components/layers/Drawers';
import { useMenuLayer } from '@material-hu/components/layers/Menus';

import { DashboardLayout } from '../../../layouts/DashboardLayout';

import CatalogItemDrawer from './components/CatalogItemDrawer';
import { CATEGORIA_LABEL, CATEGORIAS } from './constants';
import {
  useArchiveCatalogItem,
  useCreateCatalogItem,
  useGetCatalog,
  useUpdateCatalogItem,
} from './hooks/useCatalog';
import { type CreateCatalogInput } from './services';
import { type CatalogItemWithUnidades } from './types';

const CatalogList = () => {
  const { items, isLoading } = useGetCatalog();
  const { openDrawer, closeDrawer } = useDrawerLayer();
  const { openMenu } = useMenuLayer();
  const { openDialog, closeDialog } = useDialogLayer();
  const create = useCreateCatalogItem();
  const update = useUpdateCatalogItem();
  const archive = useArchiveCatalogItem();

  const openCreate = () => {
    openDrawer({
      wrapperProps: { anchor: 'right' },
      content: (
        <CatalogItemDrawer
          onClose={() => closeDrawer()}
          onSubmit={async (input: CreateCatalogInput) => {
            await create.mutateAsync(input);
            closeDrawer();
          }}
        />
      ),
    });
  };

  const openEdit = (item: CatalogItemWithUnidades) => {
    openDrawer({
      wrapperProps: { anchor: 'right' },
      content: (
        <CatalogItemDrawer
          item={item}
          onClose={() => closeDrawer()}
          onSubmit={async (input: CreateCatalogInput) => {
            await update.mutateAsync({ id: item.id, input });
            closeDrawer();
          }}
        />
      ),
    });
  };

  const handleArchive = (item: CatalogItemWithUnidades) => {
    openDialog({
      title: '¿Archivar tipo?',
      textBody: `"${item.nombre}" dejará de aparecer en el catálogo. Los materiales existentes no se verán afectados.`,
      primaryButtonProps: {
        children: 'Archivar',
        color: 'error',
        onClick: () => {
          archive.mutate(item.id);
          closeDialog();
        },
      },
      secondaryButtonProps: {
        children: 'Cancelar',
        onClick: () => closeDialog(),
      },
    });
  };

  const handleRowMenu = (
    e: React.MouseEvent<HTMLElement>,
    item: CatalogItemWithUnidades,
  ) => {
    openMenu({
      anchorEl: e.currentTarget,
      items: [
        {
          id: 'edit',
          title: 'Editar',
          icon: IconEdit,
          onSelect: () => openEdit(item),
        },
        {
          id: 'archive',
          title: 'Archivar',
          icon: IconArchive,
          onSelect: () => handleArchive(item),
        },
      ],
    });
  };

  return (
    <DashboardLayout>
      <Stack sx={{ gap: 3 }}>
        <Stack
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Title
            title="Catálogo"
            description="Tipos de materiales definidos en el sistema."
            variant="L"
          />
          <Button
            variant="primary"
            size="large"
            startIcon={<IconPlus size={20} />}
            onClick={openCreate}
            sx={{ flexShrink: 0 }}
          >
            Nuevo tipo
          </Button>
        </Stack>

        {CATEGORIAS.map(cat => {
          const catItems = items.filter(i => i.categoria === cat);
          if (catItems.length === 0) return null;
          return (
            <Stack
              key={cat}
              sx={{ gap: 2 }}
            >
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: '0.08em', fontWeight: 600 }}
              >
                {CATEGORIA_LABEL[cat]}
              </Typography>
              <Paper
                variant="outlined"
                sx={{ borderRadius: 2, overflow: 'hidden' }}
              >
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 520 }}>
                    <TableHead>
                      <TableRow headerRow>
                        <TableCell headerCell>Tipo</TableCell>
                        <TableCell headerCell>Dueño por defecto</TableCell>
                        <TableCell headerCell>N° de serie</TableCell>
                        <TableCell headerCell>Unidades</TableCell>
                        <TableCell
                          headerCell
                          sx={{ width: 48 }}
                        />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {catItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {item.nombre}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Pills
                              label={
                                item.duenoPorDefecto === 'proa'
                                  ? 'PROA'
                                  : 'CLIENTE'
                              }
                              type="neutral"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {item.requiereNumeroSerie ? 'Sí' : 'No'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {item.unidades}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={e => handleRowMenu(e, item)}
                              aria-label="Acciones"
                            >
                              <IconDotsVertical size={18} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Stack>
          );
        })}

        {items.length === 0 && !isLoading && (
          <StateCard
            slotProps={{
              title: {
                title: 'El catálogo está vacío',
                description: 'Agregá el primer tipo de material para empezar.',
                variant: 'M',
              },
              avatar: {
                Icon: IconInfoCircle,
                color: 'default',
              },
            }}
          />
        )}
      </Stack>
    </DashboardLayout>
  );
};

export default CatalogList;
