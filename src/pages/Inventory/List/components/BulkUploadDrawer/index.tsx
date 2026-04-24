import { useRef, useState } from 'react';

import {
  IconCheck,
  IconDownload,
  IconUpload,
  IconX,
} from '@material-hu/icons/tabler';
import Box from '@material-hu/mui/Box';
import Chip from '@material-hu/mui/Chip';
import Divider from '@material-hu/mui/Divider';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';
import * as XLSX from 'xlsx';

import Button from '@material-hu/components/design-system/Buttons/Button';

import { useCreateMaterial } from '../../hooks/useCreateMaterial';
import { type CreateMaterialInput } from '../../services';
import {
  type MaterialDueño,
  type MaterialEstadoFisico,
  type MaterialPais,
  type MaterialTipo,
} from '../../types';

type Props = {
  onClose: () => void;
  onSuccess: (count: number) => void;
};

type Step = 1 | 2 | 3;

type ParsedRow = {
  tipo: string;
  detalle: string;
  estadoFisico: string;
  osc: string;
  dueño: string;
  cantidad: string;
  plaza: string;
  pais: string;
  lineaTelefonica: string;
  observaciones: string;
};

const VALID_TIPOS: MaterialTipo[] = [
  'pechera',
  'filmina',
  'tira_credencial',
  'gorra',
  'remera',
  'celular',
  'tablet',
  'cargador',
  'funda',
  'banner',
  'otro',
];
const VALID_ESTADOS_FISICOS: MaterialEstadoFisico[] = ['ok', 'dañado'];
const VALID_DUEÑOS: MaterialDueño[] = ['proa', 'cliente'];
const VALID_PAISES: MaterialPais[] = ['AR', 'UY', 'GT'];

const TEMPLATE_HEADERS = [
  'tipo',
  'detalle',
  'estadoFisico',
  'osc',
  'dueño',
  'cantidad',
  'plaza',
  'pais',
  'lineaTelefonica',
  'observaciones',
];

const HEADER_LABELS: Record<string, string> = {
  tipo: 'Tipo',
  detalle: 'Detalle',
  estadoFisico: 'Estado físico',
  osc: 'OSC',
  dueño: 'Dueño',
  cantidad: 'Cantidad',
  plaza: 'Plaza',
  pais: 'País',
  lineaTelefonica: 'Línea telefónica',
  observaciones: 'Observaciones',
};

const EXAMPLE_ROW: Record<string, string> = {
  tipo: 'pechera',
  detalle: 'CON CIERRE',
  estadoFisico: 'ok',
  osc: 'UNICEF',
  dueño: 'proa',
  cantidad: '1',
  plaza: 'Catamarca Foc',
  pais: 'AR',
  lineaTelefonica: '',
  observaciones: '',
};

const NOTES_ROW: Record<string, string> = {
  tipo: VALID_TIPOS.join(' | '),
  detalle: 'Texto libre',
  estadoFisico: VALID_ESTADOS_FISICOS.join(' | '),
  osc: 'Texto libre',
  dueño: VALID_DUEÑOS.join(' | '),
  cantidad: 'Número entero',
  plaza: 'Texto libre',
  pais: VALID_PAISES.join(' | '),
  lineaTelefonica: 'Opcional',
  observaciones: 'Opcional',
};

function downloadTemplate() {
  const wb = XLSX.utils.book_new();
  const headerRow = TEMPLATE_HEADERS.map(h => HEADER_LABELS[h]);
  const exampleRow = TEMPLATE_HEADERS.map(h => EXAMPLE_ROW[h]);
  const notesRow = TEMPLATE_HEADERS.map(h => `[${NOTES_ROW[h]}]`);
  const ws = XLSX.utils.aoa_to_sheet([headerRow, exampleRow, notesRow]);

  ws['!cols'] = TEMPLATE_HEADERS.map(() => ({ wch: 22 }));

  XLSX.utils.book_append_sheet(wb, ws, 'Materiales');
  XLSX.writeFile(wb, 'plantilla_materiales.xlsx');
}

function validateRow(row: ParsedRow, index: number): string | null {
  if (!VALID_TIPOS.includes(row.tipo as MaterialTipo)) {
    return `Fila ${index + 1}: tipo "${row.tipo}" no es válido. Usá uno de: ${VALID_TIPOS.join(', ')}`;
  }
  if (!row.detalle?.trim()) {
    return `Fila ${index + 1}: detalle es obligatorio`;
  }
  if (
    !VALID_ESTADOS_FISICOS.includes(row.estadoFisico as MaterialEstadoFisico)
  ) {
    return `Fila ${index + 1}: estadoFisico "${row.estadoFisico}" no es válido. Usá: ${VALID_ESTADOS_FISICOS.join(', ')}`;
  }
  if (!row.osc?.trim()) {
    return `Fila ${index + 1}: osc es obligatorio`;
  }
  if (!VALID_DUEÑOS.includes(row.dueño as MaterialDueño)) {
    return `Fila ${index + 1}: dueño "${row.dueño}" no es válido. Usá: ${VALID_DUEÑOS.join(', ')}`;
  }
  const cantidad = Number(row.cantidad);
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    return `Fila ${index + 1}: cantidad debe ser un número entero mayor a 0`;
  }
  if (!row.plaza?.trim()) {
    return `Fila ${index + 1}: plaza es obligatorio`;
  }
  if (!VALID_PAISES.includes(row.pais as MaterialPais)) {
    return `Fila ${index + 1}: país "${row.pais}" no es válido. Usá: ${VALID_PAISES.join(', ')}`;
  }
  return null;
}

function parseExcel(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
          defval: '',
        });

        const parsed = rows
          .filter(r => {
            const tipo = (r['Tipo'] ?? r['tipo'] ?? '').toString().trim();
            return tipo && !tipo.startsWith('[');
          })
          .map(r => ({
            tipo: (r['Tipo'] ?? r['tipo'] ?? '')
              .toString()
              .trim()
              .toLowerCase(),
            detalle: (r['Detalle'] ?? r['detalle'] ?? '').toString().trim(),
            estadoFisico: (r['Estado físico'] ?? r['estadoFisico'] ?? '')
              .toString()
              .trim()
              .toLowerCase(),
            osc: (r['OSC'] ?? r['osc'] ?? '').toString().trim(),
            dueño: (r['Dueño'] ?? r['dueño'] ?? '')
              .toString()
              .trim()
              .toLowerCase(),
            cantidad: (r['Cantidad'] ?? r['cantidad'] ?? '').toString().trim(),
            plaza: (r['Plaza'] ?? r['plaza'] ?? '').toString().trim(),
            pais: (r['País'] ?? r['pais'] ?? '')
              .toString()
              .trim()
              .toUpperCase(),
            lineaTelefonica: (
              r['Línea telefónica'] ??
              r['lineaTelefonica'] ??
              ''
            )
              .toString()
              .trim(),
            observaciones: (r['Observaciones'] ?? r['observaciones'] ?? '')
              .toString()
              .trim(),
          }));

        resolve(parsed);
      } catch {
        reject(
          new Error(
            'No se pudo leer el archivo. Asegurate de subir un .xlsx válido.',
          ),
        );
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsArrayBuffer(file);
  });
}

export const BulkUploadDrawer = ({ onClose, onSuccess }: Props) => {
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createMaterial = useCreateMaterial();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setErrors([]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    setErrors([]);

    try {
      const rows = await parseExcel(file);

      if (rows.length === 0) {
        setErrors([
          'La planilla no tiene filas con datos. Completá al menos una fila y volvé a intentarlo.',
        ]);
        setIsLoading(false);
        return;
      }

      const validationErrors: string[] = [];
      for (let i = 0; i < rows.length; i++) {
        const err = validateRow(rows[i], i);
        if (err) validationErrors.push(err);
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setIsLoading(false);
        return;
      }

      for (const row of rows) {
        const input: CreateMaterialInput = {
          tipo: row.tipo as MaterialTipo,
          detalle: row.detalle,
          estadoFisico: row.estadoFisico as MaterialEstadoFisico,
          osc: row.osc,
          dueño: row.dueño as MaterialDueño,
          cantidad: Number(row.cantidad),
          plaza: row.plaza,
          pais: row.pais as MaterialPais,
          lineaTelefonica: row.lineaTelefonica || null,
          observaciones: row.observaciones || null,
        };
        await createMaterial.mutateAsync(input);
      }

      onSuccess(rows.length);
    } catch (err) {
      setErrors([(err as Error).message]);
    } finally {
      setIsLoading(false);
    }
  };

  const steps: { number: Step; label: string }[] = [
    { number: 1, label: 'Descargá la planilla' },
    { number: 2, label: 'Completá los datos' },
    { number: 3, label: 'Subí la planilla' },
  ];

  return (
    <Stack sx={{ width: 480, height: '100%', flexDirection: 'column' }}>
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
        >
          Carga masiva de materiales
        </Typography>
        <Button
          variant="text"
          size="small"
          onClick={onClose}
          sx={{ minWidth: 0, p: 0.5 }}
        >
          <IconX size={20} />
        </Button>
      </Stack>

      <Stack sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3, gap: 0 }}>
        {steps.map(({ number, label }) => {
          const isActive = step === number;
          const isDone = step > number;

          return (
            <Stack
              key={number}
              sx={{ flexDirection: 'row', gap: 2 }}
            >
              <Stack sx={{ alignItems: 'center', gap: 0 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: isDone
                      ? 'success.main'
                      : isActive
                        ? 'primary.main'
                        : 'action.disabled',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isDone ? (
                    <IconCheck
                      size={16}
                      color="white"
                    />
                  ) : (
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="white"
                    >
                      {number}
                    </Typography>
                  )}
                </Box>
                {number < 3 && (
                  <Box
                    sx={{
                      width: 2,
                      flex: 1,
                      minHeight: 24,
                      bgcolor: isDone ? 'success.main' : 'divider',
                      my: 0.5,
                    }}
                  />
                )}
              </Stack>

              <Stack sx={{ flex: 1, pb: number < 3 ? 2 : 0 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color={
                    isActive
                      ? 'text.primary'
                      : isDone
                        ? 'text.secondary'
                        : 'text.disabled'
                  }
                  sx={{ mt: 0.5, mb: isActive ? 2 : 0 }}
                >
                  {label}
                </Typography>

                {isActive && number === 1 && (
                  <Stack sx={{ gap: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Descargá la plantilla de Excel con todas las columnas
                      necesarias. La segunda fila tiene un ejemplo y la tercera
                      los valores válidos para cada campo.
                    </Typography>
                    <Button
                      variant="secondary"
                      size="medium"
                      startIcon={<IconDownload size={16} />}
                      onClick={downloadTemplate}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Descargar plantilla
                    </Button>
                    <Divider />
                    <Stack
                      sx={{
                        flexDirection: 'row',
                        gap: 1,
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Button
                        variant="text"
                        size="medium"
                        onClick={onClose}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="primary"
                        size="medium"
                        onClick={() => setStep(2)}
                      >
                        Siguiente
                      </Button>
                    </Stack>
                  </Stack>
                )}

                {isActive && number === 2 && (
                  <Stack sx={{ gap: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Completá la planilla con los materiales que querés cargar.
                      Cada fila es un material. Podés dejar en blanco los campos
                      opcionales (línea telefónica y observaciones).
                    </Typography>
                    <Stack sx={{ gap: 1 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        Valores válidos para campos con opciones fijas:
                      </Typography>
                      {[
                        { label: 'Tipo', values: VALID_TIPOS },
                        {
                          label: 'Estado físico',
                          values: VALID_ESTADOS_FISICOS,
                        },
                        { label: 'Dueño', values: VALID_DUEÑOS },
                        { label: 'País', values: VALID_PAISES },
                      ].map(({ label, values }) => (
                        <Stack
                          key={label}
                          sx={{
                            flexDirection: 'row',
                            gap: 1,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ minWidth: 80 }}
                          >
                            {label}:
                          </Typography>
                          {values.map(v => (
                            <Chip
                              key={v}
                              label={v}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      ))}
                    </Stack>
                    <Divider />
                    <Stack
                      sx={{
                        flexDirection: 'row',
                        gap: 1,
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Button
                        variant="text"
                        size="medium"
                        onClick={() => setStep(1)}
                      >
                        Volver
                      </Button>
                      <Button
                        variant="primary"
                        size="medium"
                        onClick={() => setStep(3)}
                      >
                        Siguiente
                      </Button>
                    </Stack>
                  </Stack>
                )}

                {isActive && number === 3 && (
                  <Stack sx={{ gap: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Subí la planilla completada. Solo se aceptan archivos
                      .xlsx.
                    </Typography>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />

                    <Stack
                      sx={{
                        border: '2px dashed',
                        borderColor: file ? 'success.main' : 'divider',
                        borderRadius: 2,
                        p: 3,
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        bgcolor: file ? 'success.50' : 'transparent',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {file ? (
                        <>
                          <IconCheck
                            size={24}
                            color="green"
                          />
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="success.main"
                          >
                            {file.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Hacé clic para cambiar el archivo
                          </Typography>
                        </>
                      ) : (
                        <>
                          <IconUpload size={24} />
                          <Typography
                            variant="body2"
                            fontWeight={600}
                          >
                            Seleccionar archivo
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Solo archivos .xlsx
                          </Typography>
                        </>
                      )}
                    </Stack>

                    {errors.length > 0 && (
                      <Stack
                        sx={{
                          gap: 0.5,
                          p: 2,
                          bgcolor: 'error.50',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'error.200',
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color="error.main"
                        >
                          Encontramos {errors.length}{' '}
                          {errors.length === 1 ? 'error' : 'errores'} en la
                          planilla:
                        </Typography>
                        {errors.map((e, i) => (
                          <Typography
                            key={i}
                            variant="caption"
                            color="error.main"
                          >
                            • {e}
                          </Typography>
                        ))}
                      </Stack>
                    )}

                    <Divider />
                    <Stack
                      sx={{
                        flexDirection: 'row',
                        gap: 1,
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Button
                        variant="text"
                        size="medium"
                        onClick={() => {
                          setStep(2);
                          setFile(null);
                          setErrors([]);
                        }}
                      >
                        Volver
                      </Button>
                      <Button
                        variant="primary"
                        size="medium"
                        disabled={!file || isLoading}
                        onClick={handleUpload}
                      >
                        {isLoading ? 'Cargando...' : 'Cargar materiales'}
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
};
