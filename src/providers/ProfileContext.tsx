import {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from 'react';

export type Perfil = 'admin' | 'lider' | 'captador';

const STORAGE_KEY = 'proa_demo_perfil';

type ProfileState = {
  perfil: Perfil;
  setPerfil: (p: Perfil) => void;
};

const ProfileCtx = createContext<ProfileState | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfilState] = useState<Perfil>(
    () => (localStorage.getItem(STORAGE_KEY) as Perfil) ?? 'admin',
  );

  const setPerfil = (p: Perfil) => {
    setPerfilState(p);
    localStorage.setItem(STORAGE_KEY, p);
  };

  return (
    <ProfileCtx.Provider value={{ perfil, setPerfil }}>
      {children}
    </ProfileCtx.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileCtx);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
