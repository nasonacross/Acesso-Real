import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile } from '../types';
import { fetchProfile, saveProfile as apiSaveProfile } from '../api';

interface AuthContextType {
  user: User;
  profile: UserProfile | null;
  loading: boolean;
  setUser: (u: User) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  switchUserRole: (role: 'visitor' | 'owner' | 'admin') => void;
  updateAccompanimentStatus: (status: 'alone' | 'accompanied' | 'undecided') => Promise<void>;
}

const defaultUser: User = {
  id: 'usr_visitante',
  name: 'Mariana Silva',
  email: 'mariana@exemplo.com.br',
  role: 'visitor',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('acesso_user');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem('acesso_user', JSON.stringify(user));
    loadUserProfile(user.id);
  }, [user.id]);

  const loadUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      const data = await fetchProfile(userId);
      setProfile(data);
    } catch (err) {
      console.error('Erro ao carregar perfil do usuário:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (!profile) throw new Error('Perfil não inicializado');
    const merged: UserProfile = {
      ...profile,
      ...updates,
      user_id: user.id,
    };
    const saved = await apiSaveProfile(user.id, merged);
    setProfile(saved);
    return saved;
  };

  const updateAccompanimentStatus = async (status: 'alone' | 'accompanied' | 'undecided') => {
    if (!profile) return;
    const updatedAcc = {
      ...profile.accompaniment,
      status,
    };
    await updateProfile({ accompaniment: updatedAcc });
  };

  const switchUserRole = (role: 'visitor' | 'owner' | 'admin') => {
    if (role === 'admin') {
      setUser({
        id: 'usr_admin',
        name: 'Administradora AcessoReal',
        email: 'admin@acessoreal.org',
        role: 'admin',
      });
    } else if (role === 'owner') {
      setUser({
        id: 'usr_gestor',
        name: 'Carlos Oliveira (Gestor Comercial)',
        email: 'gestor@supermercadocentral.com.br',
        role: 'owner',
      });
    } else {
      setUser(defaultUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        setUser,
        updateProfile,
        switchUserRole,
        updateAccompanimentStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
