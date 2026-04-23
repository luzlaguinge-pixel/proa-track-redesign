import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useAuth } from './AuthContext';
import { getRoleForId, setRoleForId } from '../stores/roleStore';

export type Perfil = 'admin' | 'lider' | 'navegante';

type ProfileState = {
  perfil: Perfil;
  assignRole: (employeeInternalId: string, role: Perfil) => void;
};

const ProfileCtx = createContext<ProfileState | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<Perfil>('navegante');

  useEffect(() => {
    if (!user) {
      setPerfil('navegante');
      return;
    }
    setPerfil(getRoleForId(user.employeeInternalId));
  }, [user]);

  const assignRole = (employeeInternalId: string, role: Perfil) => {
    setRoleForId(employeeInternalId, role);
    // If assigning to the current user, update state immediately
    if (user && user.employeeInternalId === employeeInternalId) {
      setPerfil(role);
    }
  };

  return (
    <ProfileCtx.Provider value={{ perfil, assignRole }}>
      {children}
    </ProfileCtx.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileCtx);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
