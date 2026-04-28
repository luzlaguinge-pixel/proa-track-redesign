import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCamera,
  IconCircleCheck,
  IconInfoCircle,
  IconX,
} from '@material-hu/icons/tabler';
import Box from '@material-hu/mui/Box';
import IconButton from '@material-hu/mui/IconButton';
import LinearProgress from '@material-hu/mui/LinearProgress';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import StateCard from '@material-hu/components/composed-components/StateCard';
import Button from '@material-hu/components/design-system/Buttons/Button';
import Autocomplete from '@material-hu/components/design-system/Inputs/Autocomplete';
import InputClassic from '@material-hu/components/design-system/Inputs/Classic';

import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { useAuth } from '../../../providers/AuthContext';
import { TIPO_LABEL } from '../../Inventory/List/constants';
import { materialsKeys } from '../../Inventory/List/hooks/useGetMaterials';
import { reportMaterial, returnMaterial } from '../../Inventory/Detail/services';
import { createSolicitud } from '../../Solicitudes/store';
import db from '../../../../mock/db.json';

import { confirmarTenencia } from './services';
import { useConfirmation } from './hooks/useConfirmation';

// ── Photo compression ─────────────────────────────────────────────────────────
// Resizes and re-encodes to JPEG at max 800px wide / 0.72 quality.
// A typical mobile camera photo (~3MB) becomes ~80-150KB after compression.

const compressImage = (base64: string): Promise<string> =>
  new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const MAX = 800;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });

// ── Person options for "entregué a..." ────────────────────────────────────────

type RawPerson = { id: string; nombre: string; dni?: string };
const ALL_PERSON_OPTIONS = (db as { persons: RawPerson[] }).persons.map(p => ({
  label: p.nombre,
  value: p.id,
  description: p.dni ? `DNI ${p.dni}` : undefined,
}));

// ── Types ─────────────────────────────────────────────────────────────────────

type NoLoTengoReason = 'perdido' | 'dañado' | 'entregue' | 'devolvi' | null;

const NO_LO_TENGO_REASONS: {
  value: NonNullable<NoLoTengoReason>;
  label: string;
  description: string;
}[] = [
  { value: 'perdido', label: 'Lo perdí', description: 'Se registrará como material perdido.' },
  { value: 'dañado', label: 'Está dañado', description: 'Se registrará el daño reportado.' },
  { value: 'entregue', label: 'Lo entregué a alguien', description: 'Se creará una solicitud de movimiento.' },
  { value: 'devolvi', label: 'Lo devolví', description: 'Se registrará la devolución al inventario.' },
];

// ── Main component ─────────────────────────────────────────────────────────────

const ConfirmationList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { materials, isLoading } = useConfirmation();
  const queryClient = useQueryClient();

  const userName = user ? `${user.firstName} ${user.lastName}` : '';

  // Only work with pending materials
  const pendientes = materials.filter(m => !m.confirmadaEsteMes);
  const total = pendientes.length;

  // Wizard state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [done, setDone] = useState(false);

  // "Tengo el material" step state
  const [foto, setFoto] = useState<string | null>(null);
  const [nota, setNota] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Error state — shown when a Supabase write fails
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // "No lo tengo" sub-flow state
  const [noLoTengo, setNoLoTengo] = useState(false);
  const [noLoTengoReason, setNoLoTengoReason] = useState<NoLoTengoReason>(null);
  const [noLoTengoMotivo, setNoLoTengoMotivo] = useState('');
  const [noLoTengoDestinatarioId, setNoLoTengoDestinatarioId] = useState<string | null>(null);
  const [noLoTengoDestinatarioInput, setNoLoTengoDestinatarioInput] = useState('');

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['confirmation-materials'] });
    queryClient.invalidateQueries({ queryKey: ['my-materials-with-confirmation'] });
    queryClient.invalidateQueries({ queryKey: materialsKeys.all() });
    queryClient.invalidateQueries({ queryKey: ['my-materials'] });
    queryClient.invalidateQueries({ queryKey: ['notificaciones-local'] });
    queryClient.invalidateQueries({ queryKey: ['notificaciones-layout'] });
  };

  const resetStepState = () => {
    setFoto(null);
    setNota('');
    setNoLoTengo(false);
    setNoLoTengoReason(null);
    setNoLoTengoMotivo('');
    setNoLoTengoDestinatarioId(null);
    setNoLoTengoDestinatarioInput('');
  };

  const advance = () => {
    invalidateAll();
    const nextIndex = currentIndex + 1;
    if (nextIndex >= total) {
      setDone(true);
      setTimeout(() => navigate('/my-materials'), 2000);
    } else {
      setCurrentIndex(nextIndex);
      resetStepState();
    }
  };

  const handleConfirmar = async () => {
    if (!foto) return;
    const material = pendientes[currentIndex];
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await confirmarTenencia({
        materialId: material.id,
        responsableNombre: userName,
        nota,
        fotoBase64: foto,
      });
      advance();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Error al guardar la confirmación. Revisá tu conexión e intentá de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNoLoTengoSubmit = async () => {
    if (!noLoTengoReason) return;
    const material = pendientes[currentIndex];
    setSubmitting(true);
    setErrorMsg(null);
    try {
      if (noLoTengoReason === 'perdido') {
        await reportMaterial({
          materialId: material.id,
          kind: 'perdido',
          motivo: noLoTengoMotivo,
          autor: userName,
        });
      } else if (noLoTengoReason === 'dañado') {
        await reportMaterial({
          materialId: material.id,
          kind: 'dañado',
          motivo: noLoTengoMotivo,
          autor: userName,
        });
      } else if (noLoTengoReason === 'entregue') {
        if (!noLoTengoDestinatarioId) {
          setSubmitting(false);
          return;
        }
        const dest = ALL_PERSON_OPTIONS.find(p => p.value === noLoTengoDestinatarioId);
        await createSolicitud({
          materialId: material.id,
          materialLabel: `${TIPO_LABEL[material.tipo]}${material.detalle ? ` · ${material.detalle}` : ''}`,
          solicitanteNombre: userName,
          destinatarioNombre: dest?.label ?? noLoTengoDestinatarioInput,
          descripcion: noLoTengoMotivo || 'Entregado físicamente',
          fecha: new Date().toISOString(),
        });
      } else if (noLoTengoReason === 'devolvi') {
        await returnMaterial({
          materialId: material.id,
          comentario: noLoTengoMotivo,
          autor: userName,
        });
      }
      advance();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Error al procesar. Revisá tu conexión e intentá de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      const raw = ev.target?.result as string;
      const compressed = await compressImage(raw);
      setFoto(compressed);
    };
    reader.readAsDataURL(file);
  };

  // ── Empty / done / loading states ──────────────────────────────────────────

  if (isLoading)
    return (
      <DashboardLayout>
        <div />
      </DashboardLayout>
    );

  if (total === 0 && !done) {
    return (
      <DashboardLayout>
        <Stack sx={{ gap: 3 }}>
          <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => navigate('/my-materials')}
              aria-label="Volver"
            >
              <IconArrowLeft size={20} />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Confirmación mensual
            </Typography>
          </Stack>
          <StateCard
            slotProps={{
              title: {
                title: 'Todo al día',
                description: 'Confirmaste todos tus materiales este mes. ¡Gracias!',
                variant: 'M',
              },
              avatar: { Icon: IconCircleCheck, color: 'success' },
            }}
          />
          <Button
            variant="secondary"
            size="medium"
            startIcon={<IconArrowLeft size={16} />}
            onClick={() => navigate('/my-materials')}
            sx={{ alignSelf: 'flex-start' }}
          >
            Volver a mis materiales
          </Button>
        </Stack>
      </DashboardLayout>
    );
  }

  if (done) {
    return (
      <DashboardLayout>
        <Stack
          sx={{
            gap: 2,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
          }}
        >
          <Stack sx={{ color: 'success.main' }}>
            <IconCircleCheck size={64} />
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }}>
            ¡Todo confirmado!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Confirmaste todos tus materiales este mes.
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Volviendo a tus materiales...
          </Typography>
        </Stack>
      </DashboardLayout>
    );
  }

  // ── Wizard step ─────────────────────────────────────────────────────────────

  const material = pendientes[currentIndex];
  const confirmedSoFar = currentIndex;
  const progressValue = (confirmedSoFar / total) * 100;

  const noLoTengoDestinatarioOption =
    ALL_PERSON_OPTIONS.find(p => p.value === noLoTengoDestinatarioId) ?? null;

  const filteredPersonOptions = noLoTengoDestinatarioInput.trim()
    ? ALL_PERSON_OPTIONS.filter(p =>
        p.label.toLowerCase().includes(noLoTengoDestinatarioInput.toLowerCase().trim()),
      )
    : ALL_PERSON_OPTIONS;

  const isNoLoTengoValid =
    noLoTengoReason !== null &&
    (noLoTengoReason !== 'entregue' || !!noLoTengoDestinatarioId);

  return (
    <DashboardLayout>
      <Stack sx={{ gap: 3, maxWidth: 540, mx: 'auto' }}>
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <Stack
          sx={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
        >
          <IconButton
            size="small"
            onClick={() => navigate('/my-materials')}
            aria-label="Volver"
          >
            <IconArrowLeft size={20} />
          </IconButton>
          <Stack sx={{ flex: 1 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontWeight: 600, lineHeight: 1.2 }}
            >
              Confirmación mensual
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentIndex + 1} de {total}{' '}
              {total === 1 ? 'material' : 'materiales'}
            </Typography>
          </Stack>
        </Stack>

        {/* ── Progress bar ────────────────────────────────────────────────── */}
        <LinearProgress
          variant="determinate"
          value={progressValue}
          sx={{ borderRadius: 4, height: 6 }}
        />

        {/* ── Material card ────────────────────────────────────────────────── */}
        <Box
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          {/* Material name/detail */}
          <Stack sx={{ gap: 0.25, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {TIPO_LABEL[material.tipo]}
            </Typography>
            {material.detalle && (
              <Typography variant="body2" color="text.secondary">
                {material.detalle}
              </Typography>
            )}
            <Typography variant="caption" color="text.disabled">
              {material.plaza}
              {material.osc ? ` · ${material.osc}` : ''}
            </Typography>
          </Stack>

          {/* ── No lo tengo sub-flow ─────────────────────────────────────── */}
          {noLoTengo ? (
            <Stack sx={{ gap: 2.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ¿Por qué no lo tenés?
              </Typography>

              {/* Reason selector */}
              <Stack sx={{ gap: 1 }}>
                {NO_LO_TENGO_REASONS.map(r => (
                  <Box
                    key={r.value}
                    onClick={() => setNoLoTengoReason(r.value)}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: '1.5px solid',
                      borderColor:
                        noLoTengoReason === r.value
                          ? 'primary.main'
                          : 'divider',
                      bgcolor:
                        noLoTengoReason === r.value
                          ? 'primary.50'
                          : 'background.paper',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, background-color 0.15s',
                      '&:hover': {
                        borderColor: 'primary.light',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: noLoTengoReason === r.value ? 600 : 400,
                      }}
                    >
                      {r.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {r.description}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {/* "Entregué a..." person autocomplete */}
              {noLoTengoReason === 'entregue' && (
                <Autocomplete
                  label="¿A quién lo entregaste?"
                  placeholder="Buscar persona..."
                  options={filteredPersonOptions}
                  value={noLoTengoDestinatarioOption}
                  inputValue={noLoTengoDestinatarioInput}
                  onInputChange={(_e, val) => {
                    setNoLoTengoDestinatarioInput(val);
                    setNoLoTengoDestinatarioId(null);
                  }}
                  onChange={val => {
                    setNoLoTengoDestinatarioId(
                      val ? String(val.value) : null,
                    );
                  }}
                  virtualized
                />
              )}

              {/* Optional description for lost/damaged */}
              {(noLoTengoReason === 'perdido' ||
                noLoTengoReason === 'dañado') && (
                <InputClassic
                  label="Descripción (opcional)"
                  placeholder="Contá qué pasó..."
                  multiline
                  minRows={2}
                  maxRows={4}
                  value={noLoTengoMotivo}
                  onChange={setNoLoTengoMotivo}
                  fullWidth
                />
              )}

              {errorMsg && (
                <Stack
                  sx={{
                    flexDirection: 'row',
                    gap: 1,
                    alignItems: 'flex-start',
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'error.50',
                    border: '1px solid',
                    borderColor: 'error.200',
                  }}
                >
                  <IconAlertTriangle size={16} color="currentColor" style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
                  <Typography variant="caption" color="error.main" sx={{ lineHeight: 1.5 }}>
                    {errorMsg}
                  </Typography>
                </Stack>
              )}

              <Stack
                sx={{ flexDirection: 'row', gap: 1, justifyContent: 'flex-end' }}
              >
                <Button
                  variant="text"
                  size="medium"
                  onClick={() => {
                    setNoLoTengo(false);
                    setNoLoTengoReason(null);
                    setNoLoTengoMotivo('');
                    setNoLoTengoDestinatarioId(null);
                    setNoLoTengoDestinatarioInput('');
                    setErrorMsg(null);
                  }}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleNoLoTengoSubmit}
                  disabled={!isNoLoTengoValid || submitting}
                  loading={submitting}
                >
                  Confirmar
                </Button>
              </Stack>
            </Stack>
          ) : (
            /* ── "Tengo el material" flow ──────────────────────────────── */
            <Stack sx={{ gap: 2.5 }}>
              {/* Photo capture */}
              <Stack sx={{ gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Foto del material{' '}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                  >
                    (requerida)
                  </Typography>
                </Typography>
                {foto ? (
                  <Stack
                    sx={{ position: 'relative', alignSelf: 'flex-start' }}
                  >
                    <Box
                      component="img"
                      src={foto}
                      alt="foto del material"
                      sx={{
                        width: '100%',
                        maxWidth: 300,
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'block',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => setFoto(null)}
                      sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                      }}
                    >
                      <IconX size={14} />
                    </IconButton>
                  </Stack>
                ) : (
                  <Stack sx={{ gap: 0.5 }}>
                    <Button
                      variant="secondary"
                      size="medium"
                      startIcon={<IconCamera size={16} />}
                      onClick={() => fileRef.current?.click()}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Tomar foto
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      Usá la cámara de tu dispositivo para fotografiar el material.
                    </Typography>
                  </Stack>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={handleFile}
                />
              </Stack>

              {/* Observations */}
              <InputClassic
                label="Observaciones (opcional)"
                placeholder="¿Algo que quieras comentar sobre este material?"
                multiline
                minRows={2}
                maxRows={4}
                value={nota}
                onChange={setNota}
                fullWidth
              />

              {/* Error feedback */}
              {errorMsg && (
                <Stack
                  sx={{
                    flexDirection: 'row',
                    gap: 1,
                    alignItems: 'flex-start',
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'error.50',
                    border: '1px solid',
                    borderColor: 'error.200',
                  }}
                >
                  <IconAlertTriangle size={16} color="currentColor" style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
                  <Typography variant="caption" color="error.main" sx={{ lineHeight: 1.5 }}>
                    {errorMsg}
                  </Typography>
                </Stack>
              )}

              {/* Primary action */}
              <Button
                variant="primary"
                size="large"
                startIcon={<IconCircleCheck size={18} />}
                onClick={handleConfirmar}
                disabled={!foto || submitting}
                loading={submitting}
                sx={{ width: '100%' }}
              >
                Confirmar — tengo el material
              </Button>

              {/* Secondary: no lo tengo */}
              <Button
                variant="text"
                size="medium"
                onClick={() => setNoLoTengo(true)}
                disabled={submitting}
                sx={{ width: '100%', color: 'text.secondary' }}
              >
                No lo tengo
              </Button>
            </Stack>
          )}
        </Box>

        {/* ── Already confirmed hint ──────────────────────────────────────── */}
        {confirmedSoFar > 0 && (
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 0.5,
              color: 'success.main',
            }}
          >
            <IconCircleCheck size={16} />
            <Typography variant="caption">
              {confirmedSoFar}{' '}
              {confirmedSoFar === 1 ? 'material confirmado' : 'materiales confirmados'} en esta sesión
            </Typography>
          </Stack>
        )}
      </Stack>
    </DashboardLayout>
  );
};

export default ConfirmationList;
