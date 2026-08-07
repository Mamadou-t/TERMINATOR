import { apiRequest, clearTokens, getRefreshToken, setTokens } from './api';

export interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  is_staff: boolean;
  cree_le: string;
}

interface ConnexionReponse {
  access: string;
  refresh: string;
  utilisateur: Utilisateur;
}

export async function connexion(email: string, password: string): Promise<Utilisateur> {
  const data = await apiRequest<ConnexionReponse>('/auth/connexion/', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
  });
  setTokens(data.access, data.refresh);
  return data.utilisateur;
}

export interface InscriptionPayload {
  email: string;
  nom: string;
  prenom: string;
  password: string;
  password_confirmation: string;
}

export async function inscription(payload: InscriptionPayload): Promise<Utilisateur> {
  return apiRequest<Utilisateur>('/auth/inscription/', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });
}

export async function deconnexion(): Promise<void> {
  const refresh = getRefreshToken();
  try {
    if (refresh) {
      await apiRequest('/auth/deconnexion/', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
      });
    }
  } finally {
    clearTokens();
  }
}

export async function recupererProfil(): Promise<Utilisateur> {
  return apiRequest<Utilisateur>('/auth/moi/');
}
