import { useState } from 'react';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';
import Checkbox from '@material-hu/mui/Checkbox';
import Button from '@material-hu/components/design-system/Buttons/Button';
import InputClassic from '@material-hu/components/design-system/Inputs/Classic';
import axios from 'axios';

interface Person {
  id: string;
  nombre: string;
  dni: string;
  email?: string;
  employeeInternalId: string;
}

interface SendNotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  people: Person[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const SendNotificationDrawer = ({
  open,
  onClose,
  people,
  onSuccess,
  onError,
}: SendNotificationDrawerProps) => {
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set(),
  );
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const getUserId = (person: Person) =>
    person.employeeInternalId || String(person.id);

  const handleSendNotification = async () => {
    if (selectedUserIds.size === 0 || !title.trim() || !body.trim()) {
      onError(
        'Por favor completa todos los campos y selecciona al menos un usuario.',
      );
      return;
    }

    setIsSending(true);
    try {
      await axios.post('/api/notifications/send', {
        userIds: Array.from(selectedUserIds),
        title,
        body,
        icon: '/logo.png',
      });
      onSuccess(`Notificación enviada a ${selectedUserIds.size} usuario(s).`);
      setSelectedUserIds(new Set());
      setTitle('');
      setBody('');
      onClose();
    } catch (error) {
      onError('Error al enviar notificación. Intenta nuevamente.');
      console.error('Notification error:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!open) return null;

  return (
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
          <Typography
            variant="h6"
            sx={{ fontWeight: 600 }}
          >
            Enviar notificación
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Selecciona usuarios y redacta el mensaje.
          </Typography>
        </Stack>

        <Stack sx={{ gap: 2 }}>
          <Stack sx={{ gap: 1 }}>
            <Typography
              variant="body2"
              fontWeight={500}
            >
              Título
            </Typography>
            <InputClassic
              placeholder="Ej: Confirmación de materiales"
              value={title}
              onChange={setTitle}
              fullWidth
            />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <Typography
              variant="body2"
              fontWeight={500}
            >
              Mensaje
            </Typography>
            <InputClassic
              placeholder="Ingresá el mensaje..."
              value={body}
              onChange={setBody}
              multiline
              minRows={3}
              maxRows={6}
              fullWidth
            />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <Typography
              variant="body2"
              fontWeight={500}
            >
              Usuarios ({selectedUserIds.size} seleccionados)
            </Typography>
            <Stack
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                maxHeight: 200,
                overflowY: 'auto',
              }}
            >
              {people.map(person => (
                <Stack
                  key={person.id}
                  sx={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => handleToggleUser(getUserId(person))}
                >
                  <Checkbox
                    checked={selectedUserIds.has(getUserId(person))}
                    onChange={() => handleToggleUser(getUserId(person))}
                    onClick={e => e.stopPropagation()}
                  />
                  <Stack sx={{ flex: 1 }}>
                    <Typography variant="body2">{person.nombre}</Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {person.dni}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Stack>
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
          onClick={onClose}
          disabled={isSending}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="medium"
          onClick={handleSendNotification}
          disabled={
            selectedUserIds.size === 0 ||
            !title.trim() ||
            !body.trim() ||
            isSending
          }
          loading={isSending}
        >
          Enviar
        </Button>
      </Stack>
    </Stack>
  );
};
