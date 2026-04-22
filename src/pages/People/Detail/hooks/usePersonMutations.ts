import { useMutation, useQueryClient } from '@tanstack/react-query';

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

import { personKeys } from './useGetPerson';

const autorFrom = (user: { firstName: string; lastName: string } | null) =>
  user ? `${user.firstName} ${user.lastName}`.trim() : 'Usuario';

export const usePersonMutations = (
  person: { id: string; nombre: string } | null,
) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: materialsKeys.all() });
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
    onSuccess: invalidate,
  });

  const notifyAll = useMutation({
    mutationFn: async (materials: Material[]) => {
      const autor = autorFrom(user);
      return Promise.all(
        materials.map(m =>
          requestConfirmation({ materialId: m.id, kind: 'notificar', autor }),
        ),
      );
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
    onSuccess: invalidate,
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
    onSuccess: invalidate,
  });

  return { assignNew, notifyAll, requestReturnAll, recoverAll, returnAll };
};
