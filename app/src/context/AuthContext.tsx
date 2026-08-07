import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clearTokens, getAccessToken } from '~/src/lib/api';
import {
  connexion as apiConnexion,
  deconnexion as apiDeconnexion,
  inscription as apiInscription,
  recupererProfil,
  type InscriptionPayload,
  type Utilisateur,
} from '~/src/lib/auth';

interface AuthContextValue {
  utilisateur: Utilisateur | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  connexion: (email: string, password: string) => Promise<void>;
  inscription: (payload: InscriptionPayload) => Promise<void>;
  deconnexion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) {
      setIsLoading(false);
      return;
    }

    recupererProfil()
      .then(setUtilisateur)
      .catch(() => {
        clearTokens();
        setUtilisateur(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const connexion = useCallback(async (email: string, password: string) => {
    const user = await apiConnexion(email, password);
    setUtilisateur(user);
  }, []);

  const inscription = useCallback(async (payload: InscriptionPayload) => {
    await apiInscription(payload);
  }, []);

  const deconnexion = useCallback(async () => {
    await apiDeconnexion();
    setUtilisateur(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ utilisateur, isAuthenticated: !!utilisateur, isLoading, connexion, inscription, deconnexion }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit etre utilise a l'interieur d'un AuthProvider");
  }
  return context;
}
