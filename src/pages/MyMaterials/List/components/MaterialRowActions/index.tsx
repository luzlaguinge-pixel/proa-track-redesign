import { useRef, useState } from 'react';

import db from '../../../../../../mock/db.json';
import { useAuth } from '../../../../../providers/AuthContext';

import {
  IconAlertTriangle,
  IconArrowRight,
  IconCircleCheck,
  IconDotsVertical,
  IconPhoto,
  IconUserX,
  IconX,
} from '@material-hu/icons/tabler';
import Box from '@material-hu/mui/Box';
import IconButton from '@material-hu/mui/IconButton';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Button from '@material-hu/components/design-system/Buttons/Button';
import Autocomplete from '@material-hu/components/design-system/Inputs/Autocomplete';
import InputClassic from '@material-hu/components/design-system/Inputs/Classic';
import Drawer from '@material-hu/components/design-system/Drawer';
import { useDialogLayer } from '@material-hu/components/layers/Dialogs';
import { useDrawerLayer } from '@material-hu/components/layers/Drawers';
import { useMenuLayer } from '@material-hu/components/layers/Menus';

import { useMaterialMutations } from '../../../../Inventory/Detail/hooks/useMaterialMutations';
import { type Material } from '../../../../Inventory/List/types';
import { confirmarTenencia } from '../../../../Confirmation/List/services';
import { createSolicitud } from '../../../../Solicitudes/store';

type Props = { material: Material };

const MaterialRowActions = ({ material }: Props) => {
  const { user } = useAuth();
  const { openMenu } = useMenuLayer();
  const { openDialog, closeDialog } = useDialogLayer();
  const { openDrawer, closeDrawer } = useDrawerLayer();
  const { report, confirm } = useMaterialMutations(material.id);

  const handleMenuClick = (e: React.MouseEvent<HTMLElement>) => {
    openMenu({
      anchorEl: e.currentTarget,
      items: [
        {
          id: 'tenencia',
          title: 'Confirmar tenencia',
          icon: IconCircleCheck,
          onSelect: () =>
            openDialog({
              content: (
                <ConfirmarTenenciaDialog
                  material={material}
                  onClose={closeDialog}
                  onSubmit={async (nota, fotoBase64) => {
                    await confirmarTenencia({
                      materialId: material.id,
                      responsableNombre: user
                        ? `${user.firstName} ${user.lastName}`
                        : '',
                      nota,
                      fotoBase64,
                    });
                    closeDialog();
                  }}
                />
              ),
            }),
        },
        {
          id: 'daño',
          title: 'Reportar daño',
          icon: IconAlertTriangle,
          onSelect: () =>
            openDialog({
              content: (
                <ReportarDialog
                  titulo="Reportar daño"
                  descripcion="Describí el daño que tiene el material."
                  onClose={closeDialog}
                  onSubmit={async motivo => {
                    await report.mutateAsync({ kind: 'dañado', motivo });
                    closeDialog();
                  }}
                />
              ),
            }),
        },
        {
          id: 'perdida',
          title: 'Reportar pérdida',
          icon: IconUserX,
          onSelect: () =>
            openDialog({
              content: (
                <ReportarDialog
                  titulo="Reportar pérdida"
                  descripcion="Describí las circunstancias de la pérdida."
                  onClose={closeDialog}
                  onSubmit={async motivo => {
                    await report.mutateAsync({ kind: 'perdido', motivo });
                    closeDialog();
                  }}
                />
              ),
            }),
        },
        {
          id: 'movimiento',
          title: 'Reportar movimiento',
          icon: IconArrowRight,
          onSelect: () =>
            openDrawer({
              content: (
                <ReportarMovimientoDialog
                  onClose={closeDrawer}
                  onSubmit={async (destinatarioNombre, motivo) => {
                    createSolicitud({
                      materialId: material.id,
                      materialLabel: `${material.tipo}${material.detalle ? ` · ${material.detalle}` : ''}`,
                      solicitanteNombre: user
                        ? `${user.firstName} ${user.lastName}`
                        : '',
                      destinatarioNombre,
                      descripcion: motivo,
                      fecha: new Date().toISOString(),
                    });
                    await confirm.mutateAsync({ kind: 'devolucion' });
                    closeDrawer();
                  }}
                />
              ),
            }),
        },
      ],
    });
  };

  return (
    <IconButton
      size="small"
      onClick={handleMenuClick}
      aria-label="Acciones"
    >
      <IconDotsVertical size={18} />
    </IconButton>
  );
};

export default MaterialRowActions;

// ─── Shared dialog components ─────────────────────────────────────────────────

type ReportarDialogProps = {
  titulo: string;
  descripcion: string;
  onClose: () => void;
  onSubmit: (motivo: string) => Promise<void>;
};

const ReportarDialog = ({
  titulo,
  descripcion,
  onClose,
  onSubmit,
}: ReportarDialogProps) => {
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(motivo);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack sx={{ p: 3, gap: 3, minWidth: 360, maxWidth: 480 }}>
      <Stack sx={{ gap: 1 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600 }}
        >
          {titulo}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {descripcion}
        </Typography>
      </Stack>
      <InputClassic
        label="Descripción"
        placeholder="Contá qué pasó..."
        multiline
        minRows={3}
        maxRows={6}
        value={motivo}
        onChange={setMotivo}
        fullWidth
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
        >
          Confirmar
        </Button>
      </Stack>
    </Stack>
  );
};

// ─── Reportar movimiento ──────────────────────────────────────────────────────

type RawPerson = { id: string; nombre: string; dni?: string };
const allPersonOptions = (db as { persons: RawPerson[] }).persons.map(p => ({
  label: p.nombre,
  value: p.id,
  description: p.dni ? `DNI ${p.dni}` : undefined,
}));

type ReportarMovimientoDialogProps = {
  onClose: () => void;
  onSubmit: (destinatarioNombre: string, motivo: string) => Promise<void>;
};

const ReportarMovimientoDialog = ({
  onClose,
  onSubmit,
}: ReportarMovimientoDialogProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [personError, setPersonError] = useState(false);

  const options = inputValue.trim()
    ? allPersonOptions.filter(
        o =>
          o.label.toLowerCase().includes(inputValue.toLowerCase().trim()) ||
          (o.description ?? '')
            .toLowerCase()
            .includes(inputValue.toLowerCase().trim()),
      )
    : allPersonOptions;

  const selectedOption =
    allPersonOptions.find(o => o.value === selectedId) ?? null;

  const handleSubmit = async () => {
    if (!selectedId) {
      setPersonError(true);
      return;
    }
    setLoading(true);
    try {
      await onSubmit(selectedOption?.label ?? selectedId, motivo);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer.Content
      title="Reportar movimiento"
      onClose={onClose}
      primaryButtonProps={{
        children: 'Confirmar',
        onClick: handleSubmit,
        loading,
      }}
      secondaryButtonProps={{
        children: 'Cancelar',
        onClick: onClose,
        disabled: loading,
      }}
    >
      <Stack sx={{ gap: 3 }}>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Indicá a quién le entregaste el material y el motivo. Un coordinador/a
          regional o admin deberá aprobarlo.
        </Typography>
        <Autocomplete
          label="Destinatario"
          placeholder="Buscar persona..."
          options={options}
          value={selectedOption}
          inputValue={inputValue}
          onInputChange={(_e, val) => setInputValue(val)}
          onChange={val => {
            setSelectedId(val ? String(val.value) : null);
            setPersonError(false);
          }}
          virtualized
          hasError={personError}
          helperText={personError ? 'Seleccioná una persona' : undefined}
        />
        <InputClassic
          label="Descripción (opcional)"
          placeholder="Contá qué pasó..."
          multiline
          minRows={3}
          maxRows={6}
          value={motivo}
          onChange={setMotivo}
          fullWidth
        />
      </Stack>
    </Drawer.Content>
  );
};

// ─── Confirmar tenencia ───────────────────────────────────────────────────────

type ConfirmarTenenciaDialogProps = {
  material: Material;
  onClose: () => void;
  onSubmit: (nota: string, fotoBase64: string | null) => Promise<void>;
};

const ConfirmarTenenciaDialog = ({
  material,
  onClose,
  onSubmit,
}: ConfirmarTenenciaDialogProps) => {
  const [nota, setNota] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setFoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(nota, foto);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack sx={{ p: 3, gap: 3, minWidth: 360, maxWidth: 480 }}>
      <Stack sx={{ gap: 0.5 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600 }}
        >
          Confirmar tenencia
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {material.tipo}
          {material.detalle ? ` · ${material.detalle}` : ''} — confirmás que lo
          tenés en tu poder.
        </Typography>
      </Stack>
      <InputClassic
        label="Nota (opcional)"
        placeholder="¿Querés agregar alguna observación?"
        multiline
        minRows={2}
        maxRows={5}
        value={nota}
        onChange={setNota}
        fullWidth
      />
      <Stack sx={{ gap: 1 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 500 }}
        >
          Foto del material
        </Typography>
        {foto ? (
          <Stack sx={{ position: 'relative', alignSelf: 'flex-start' }}>
            <Box
              component="img"
              src={foto}
              alt="foto"
              sx={{
                width: 200,
                height: 140,
                objectFit: 'cover',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
            <IconButton
              size="small"
              onClick={() => setFoto(null)}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                bgcolor: 'background.paper',
              }}
            >
              <IconX size={14} />
            </IconButton>
          </Stack>
        ) : (
          <Button
            variant="secondary"
            size="medium"
            startIcon={<IconPhoto size={16} />}
            onClick={() => fileRef.current?.click()}
            sx={{ alignSelf: 'flex-start' }}
          >
            Subir foto
          </Button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </Stack>
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
          disabled={!foto}
        >
          Confirmar
        </Button>
      </Stack>
    </Stack>
  );
};
