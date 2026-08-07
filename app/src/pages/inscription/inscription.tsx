import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { Alert, Button, InputText } from '~/src/components';
import { useAuth } from '~/src/context/AuthContext';
import { formatApiError } from '~/src/lib/api';

export default function Inscription() {
  const navigate = useNavigate();
  const { connexion: seConnecter, inscription: sInscrire, isAuthenticated, isLoading } = useAuth();

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);

    try {
      await sInscrire({ nom, prenom, email, password, password_confirmation: passwordConfirmation });
      await seConnecter(email, password);
      navigate('/');
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900">TERMINATOR</h1>
          <p className="mt-2 text-slate-600">Creez votre compte pour gerer vos projets</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert variant="error" message={error} />}

            <div className="flex gap-4">
              <InputText
                label="Prenom"
                placeholder="Mamadou"
                value={prenom}
                onChange={(event) => setPrenom(event.target.value)}
                required
                fullWidth
              />

              <InputText
                label="Nom"
                placeholder="Toure"
                value={nom}
                onChange={(event) => setNom(event.target.value)}
                required
                fullWidth
              />
            </div>

            <InputText
              type="email"
              label="Email"
              placeholder="vous@exemple.com"
              icon="mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              fullWidth
            />

            <InputText
              type="password"
              label="Mot de passe"
              placeholder="********"
              icon="eye-off"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              fullWidth
            />

            <InputText
              type="password"
              label="Confirmer le mot de passe"
              placeholder="********"
              icon="eye-off"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              required
              fullWidth
            />

            <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
              Creer mon compte
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Deja un compte ?{' '}
          <Link to="/login" className="font-medium text-[#1e3a5f] hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
