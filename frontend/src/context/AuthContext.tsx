import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile } from '../types';
import { fetchProfile, saveProfile as apiSaveProfile, registerUserApi, loginUserApi } from '../api';

interface AuthContextType {
  user: User;
  profile: UserProfile | null;
  isRegisteredUser: boolean;
  loading: boolean;
  setUser: (u: User) => void;
  registerAccount: (payload: {
    name: string;
    email: string;
    password: string;
    role?: 'visitor' | 'owner';
    profileData?: Partial<UserProfile>;
  }) => Promise<void>;
  loginAccount: (email: string, password: string) => Promise<void>;
  logoutAccount: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  switchUserRole: (role: 'visitor' | 'owner') => void;
  updateAccompanimentStatus: (status: 'alone' | 'accompanied' | 'undecided') => Promise<void>;
}

const guestUser: User = {
  id: 'usr_visitante',
  name: 'Perfil Personalizado',
  email: '',
  role: 'visitor',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('acesso_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.role === 'admin') return guestUser;
      return parsed;
    }
    return guestUser;
  });

  const [isRegisteredUser, setIsRegisteredUser] = useState<boolean>(() => {
    return localStorage.getItem('acesso_is_registered') === 'true';
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

  const registerAccount = async (payload: {
    name: string;
    email: string;
    password: string;
    role?: 'visitor' | 'owner';
    profileData?: Partial<UserProfile>;
  }) => {
    const { user: createdUser, profile: createdProfile } = await registerUserApi(payload);
    localStorage.setItem('acesso_is_registered', 'true');
    localStorage.setItem('acesso_user', JSON.stringify(createdUser));
    setIsRegisteredUser(true);
    setUser(createdUser);
    setProfile(createdProfile);
  };

  const loginAccount = async (email: string, password: string) => {
    const { user: loggedUser, profile: loadedProfile } = await loginUserApi({ email, password });
    localStorage.setItem('acesso_is_registered', 'true');
    localStorage.setItem('acesso_user', JSON.stringify(loggedUser));
    setIsRegisteredUser(true);
    setUser(loggedUser);
    setProfile(loadedProfile);
  };

  const logoutAccount = () => {
    localStorage.setItem('acesso_is_registered', 'false');
    localStorage.setItem('acesso_user', JSON.stringify(guestUser));
    setIsRegisteredUser(false);
    setUser(guestUser);
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

  const switchUserRole = (role: 'visitor' | 'owner') => {
    if (role === 'owner') {
      setUser({
        id: 'usr_gestor',
        name: 'Perfil Gestor',
        email: 'gestor@acessoreal.org',
        role: 'owner',
      });
    } else {
      const savedRegistered = localStorage.getItem('acesso_is_registered') === 'true';
      if (savedRegistered) {
        const savedUser = localStorage.getItem('acesso_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed.role === 'visitor') {
            setUser(parsed);
            return;
          }
        }
      }
      setUser(guestUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isRegisteredUser,
        loading,
        setUser,
        registerAccount,
        loginAccount,
        logoutAccount,
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
