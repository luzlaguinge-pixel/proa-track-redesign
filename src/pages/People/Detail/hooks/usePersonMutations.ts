import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DISPATCHED_NOTIFS_KEY } from '../../../../hooks/useDispatchedNotifications';

import { useAuth } from '../../../../providers/AuthContext';
import {
  assignMaterial,
  markRecovered,
  requestConfirmation,
  returnMaterial,
} from '../../../Inventory/Detail/services';
import { type Person } from '../../../Inventory/Detail/types';
import { materialsKeys } from '../../../Inventory/List/hooks/useGetMaterials';
import { type Material } from '../../../Inventory/List/types';
import {
  isPendingRecovery,
  resolveTermination,
} from '../../lifecycleStore';

import { updatePersonContact } from '../services';
import { personKeys } from './useGetPerson';

const autorFrom = (user: { firstName: string; lastName: string } | null) =>
  user ? `${user.firstName} ${user.lastName}`.trim() : 'Usuario';

export const usePersonMutations = (
  person: { id: string; nombre: string; email?: string } | null,
) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: materialsKeys.all() });
    queryClient.invalidateQueries({ queryKey: ['persons'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    if (person) {
      queryClient.invalidateQueries({
        queryKey: personKeys.materials(person.nombre),
      });
    }
  };

  const assignNew = useMutation({
    mutationFn: async (input: {
      material: Material;
      comodato: boolean;
      observacion: string;
    }) => {
      if (!person) return null;
      const p: Person = {
        id: person.id,
        nombre: person.nombre,
        dni: '',
        telefono: '',
      };
      return assignMaterial({
        materialId: input.material.id,
        person: p,
        comodato: input.comodato,
        observacion: input.observacion,
        autor: autorFrom(user),
      });
    },
    onSuccess: () => {
      invalidate();
      // Fire in-app notification to the person being assigned the material
      const recipientEmail = person?.email;
      if (recipientEmail) {
        const dispatcherName = autorFrom(user);
        const dispatcherId =
          (user as { employeeInternalId?: string } | null)?.employeeInternalId ??
          String((user as { id?: number } | null)?.id ?? 'admin');
        fetch('/api/notifications/send-custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userIds: [recipientEmail],
            title: 'Nuevo material asignado',
            body: 'Se te asignó un material. Revisá "Mis materiales" para confirmar la tenencia.',
            url: '/my-materials',
            dispatcherName,
            dispatcherId,
          }),
        })
          .then(() => queryClient.invalidateQueries({ queryKey: DISPATCHED_NOTIFS_KEY }))
          .catch(err => console.error('[assignNew] notification dispatch failed:', err));
      }
    },
  });

  const notifyAll = useMutation({
    mutationFn: async (materials: Material[]) => {
      const autor = autorFrom(user);

      // 1. Write historial events for each material (local record)
      await Promise.all(
        materials.map(m =>
          requestConfirmation({ materialId: m.id, kind: 'notificar', autor }),
        ),
      );

      // 2. Send dual-channel notification (in-app + push) to the person
      const personEmail = person?.email;
      if (personEmail) {
        const dispatcherName = autorFrom(user);
        const dispatcherId =
          (user as { employeeInternalId?: string } | null)?.employeeInternalId ??
          String((user as { id?: number } | null)?.id ?? 'admin');

        fetch('/api/notifications/send-custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userIds: [personEmail],
            title: 'Confirmá tus materiales',
            body: `Se te solicita confirmar la tenencia de tus ${materials.length} ${materials.length === 1 ? 'material' : 'materiales'} asignados.`,
            url: '/my-materials',
            dispatcherName,
            dispatcherId,
          }),
        }).catch(err => console.error('[notifyAll] dispatch failed:', err));
      }
    },
    onSuccess: invalidate,
  });

  const requestReturnAll = useMutation({
    mutationFn: async (materials: Material[]) => {
      const autor = autorFrom(user);
      return Promise.all(
        materials.map(m =>
          requestConfirmation({ materialId: m.id, kind: 'devolucion', autor }),
        ),
      );
    },
    onSuccess: invalidate,
  });

  const recoverAll = useMutation({
    mutationFn: async (materials: Material[]) => {
      const autor = autorFrom(user);
      return Promise.all(
        materials.map(m =>
          markRecovered({
            materialId: m.id,
            comentario: '',
            quedaOk: true,
            autor,
          }),
        ),
      );
    },
    onSuccess: () => {
      // If this person was in pending_recovery and all their materials are now
      // resolved, auto-transition them to fully terminated.
      if (person && isPendingRecovery(person.id)) {
        resolveTermination(person.id);
      }
      invalidate();
    },
  });

  const returnAll = useMutation({
    mutationFn: async (materials: Material[]) => {
      const autor = autorFrom(user);
      return Promise.all(
        materials.map(m =>
          returnMaterial({ materialId: m.id, comentario: '', autor }),
        ),
      );
    },
    onSuccess: () => {
      // If person was in pending_recovery and all materials are now returned,
      // auto-transition to terminated (same logic as recoverAll).
      if (person && isPendingRecovery(person.id)) {
        resolveTermination(person.id);
      }
      invalidate();
    },
  });

  const updateContact = useMutation({
    mutationFn: (fields: { dni?: string; telefono?: string }) => {
      if (!person) return Promise.resolve();
      return updatePersonContact(person.id, fields);
    },
    onSuccess: () => {
      if (person) {
        queryClient.invalidateQueries({
          queryKey: personKeys.detail(person.id),
        });
      }
    },
  });

  return {
    assignNew,
    notifyAll,
    requestReturnAll,
    recoverAll,
    returnAll,
    updateContact,
  };
};
