import { useState } from 'react';

import Stack from '@material-hu/mui/Stack';

import Drawer from '@material-hu/components/design-system/Drawer';
import Autocomplete from '@material-hu/components/design-system/Inputs/Autocomplete';
import InputClassic from '@material-hu/components/design-system/Inputs/Classic';

import {
  DUEÑO_LABEL,
  TIPO_LABEL,
} from '../../constants';
import type {
  MaterialDueño,
  MaterialEstadoFisico,
  MaterialPais,
  MaterialTipo,
} from '../../types';
import type { CreateMaterialInput } from '../../services';

const TIPO_OPTIONS = (Object.entries(TIPO_LABEL) as [MaterialTipo, string][]).map(
  ([value, label]) => ({ label, value }),
);

const DUEÑO_OPTIONS = (Object.entries(DUEÑO_LABEL) as [MaterialDueño, string][]).map(
  ([value, label]) => ({ label, value }),
);

const ESTADO_FISICO_OPTIONS: { label: string; value: MaterialEstadoFisico }[] = [
  { label: 'OK', value: 'ok' },
  { label: 'Dañado', value: 'dañado' },
];

const PAIS_OPTIONS: { label: string; value: MaterialPais }[] = [
  { label: 'Argentina', value: 'AR' },
  { label: 'Uruguay', value: 'UY' },
  { label: 'Guatemala', value: 'GT' },
];

const TIPOS_CON_LINEA: MaterialTipo[] = ['celular', 'tablet'];

type CreateMaterialDrawerProps = {
  onClose: () => void;
  onSubmit: (input: CreateMaterialInput) => Promise<void> | void;
};

type FormErrors = Partial<Record<keyof CreateMaterialInput, string>>;

const CreateMaterialDrawer = ({ onClose, onSubmit }: CreateMaterialDrawerProps) => {
  const [tipo, setTipo] = useState<MaterialTipo | null>(null);
  const [detalle, setDetalle] = useState('');
  const [estadoFisico, setEstadoFisico] = useState<MaterialEstadoFisico>('ok');
  const [osc, setOsc] = useState('');
  const [dueño, setDueño] = useState<MaterialDueño | null>(null);
  const [cantidad, setCantidad] = useState('1');
  const [plaza, setPlaza] = useState('');
  const [pais, setPais] = useState<MaterialPais | null>(null);
  const [lineaTelefonica, setLineaTelefonica] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const showLinea = tipo !== null && TIPOS_CON_LINEA.includes(tipo);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!tipo) next.tipo = 'Requerido';
    if (!detalle.trim()) next.detalle = 'Requerido';
    if (!osc.trim()) next.osc = 'Requerido';
    if (!dueño) next.dueño = 'Requerido';
    if (!plaza.trim()) next.plaza = 'Requerido';
    if (!pais) next.pais = 'Requerido';
    const cantidadNum = parseInt(cantidad, 10);
    if (!cantidad || isNaN(cantidadNum) || cantidadNum < 1) next.cantidad = 'Debe ser mayor a 0';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        tipo: tipo!,
        detalle: detalle.trim(),
        estadoFisico,
        osc: osc.trim(),
        dueño: dueño!,
        cantidad: parseInt(cantidad, 10),
        plaza: plaza.trim(),
        pais: pais!,
        lineaTelefonica: showLinea && lineaTelefonica.trim() ? lineaTelefonica.trim() : null,
        observaciones: observaciones.trim() || null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <Drawer.Content
      title="Nuevo material"
      onClose={onClose}
      primaryButtonProps={{
        children: 'Crear material',
        onClick: handleSubmit,
        loading: submitting,
      }}
      secondaryButtonProps={{
        children: 'Cancelar',
        onClick: onClose,
        disabled: submitting,
      }}
    >
      <Stack sx={{ gap: 2.5 }}>
        <Autocomplete
          label="Tipo"
          placeholder="Seleccioná el tipo..."
          options={TIPO_OPTIONS}
          value={TIPO_OPTIONS.find(o => o.value === tipo) ?? null}
          onChange={opt => {
            setTipo(opt ? (opt.value as MaterialTipo) : null);
            clearError('tipo');
          }}
          hasError={!!errors.tipo}
          helperText={errors.tipo}
        />
        <InputClassic
          label="Detalle"
          placeholder="Ej: CON CIERRE, 32GB..."
          value={detalle}
          onChange={v => { setDetalle(v); clearError('detalle'); }}
          error={!!errors.detalle}
          errorText={errors.detalle}
          fullWidth
        />
        <Autocomplete
          label="Estado físico"
          placeholder="Seleccioná el estado..."
          options={ESTADO_FISICO_OPTIONS}
          value={ESTADO_FISICO_OPTIONS.find(o => o.value === estadoFisico) ?? null}
          onChange={opt => {
            if (opt) setEstadoFisico(opt.value as MaterialEstadoFisico);
          }}
        />
        <Autocomplete
          label="Dueño"
          placeholder="Seleccioná el dueño..."
          options={DUEÑO_OPTIONS}
          value={DUEÑO_OPTIONS.find(o => o.value === dueño) ?? null}
          onChange={opt => {
            setDueño(opt ? (opt.value as MaterialDueño) : null);
            clearError('dueño');
          }}
          hasError={!!errors.dueño}
          helperText={errors.dueño}
        />
        <InputClassic
          label="OSC"
          placeholder="Nombre de la organización..."
          value={osc}
          onChange={v => { setOsc(v); clearError('osc'); }}
          error={!!errors.osc}
          errorText={errors.osc}
          fullWidth
        />
        <InputClassic
          label="Plaza"
          placeholder="Ej: Catamarca Foc..."
          value={plaza}
          onChange={v => { setPlaza(v); clearError('plaza'); }}
          error={!!errors.plaza}
          errorText={errors.plaza}
          fullWidth
        />
        <Autocomplete
          label="País"
          placeholder="Seleccioná el país..."
          options={PAIS_OPTIONS}
          value={PAIS_OPTIONS.find(o => o.value === pais) ?? null}
          onChange={opt => {
            setPais(opt ? (opt.value as MaterialPais) : null);
            clearError('pais');
          }}
          hasError={!!errors.pais}
          helperText={errors.pais}
        />
        <InputClassic
          label="Cantidad"
          placeholder="1"
          value={cantidad}
          onChange={v => { setCantidad(v); clearError('cantidad'); }}
          error={!!errors.cantidad}
          errorText={errors.cantidad}
          fullWidth
        />
        {showLinea && (
          <InputClassic
            label="Línea telefónica (opcional)"
            placeholder="Ej: +54 9 11 1234-5678"
            value={lineaTelefonica}
            onChange={setLineaTelefonica}
            fullWidth
          />
        )}
        <InputClassic
          label="Observaciones (opcional)"
          placeholder="Notas adicionales..."
          multiline
          minRows={3}
          maxRows={6}
          value={observaciones}
          onChange={setObservaciones}
          fullWidth
        />
      </Stack>
    </Drawer.Content>
  );
};

export default CreateMaterialDrawer;
