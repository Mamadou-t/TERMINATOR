import React, { useState } from 'react';
import { Button, InputText, Icon, Alert } from '~/src/components';
import { Link } from 'react-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!email || !password) {
        setError('Veuillez remplir tous les champs');
        setLoading(false);
        return;
      }

      // Redirection après connexion
      window.location.href = '/';
    } catch (err) {
      setError('Une erreur est survenue');
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br  flex items-center justify-center p-4 relative overflow-hidden'>
      {/* Décoration de fond */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse'></div>
        <div className='absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse' style={{animationDelay: '2s'}}></div>
      </div>

      {/* Contenu */}
      <div className='relative z-10 w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-12'>

          <h1 className='text-4xl font-bold text-black mb-2'>TERMINATOR</h1>
        </div>

        {/* Formulaire Card */}
        <div className='bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 mb-6'>
          {/* Titre */}
          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-white mb-2'>Bienvenue</h2>
            <p className='text-slate-400 text-sm'>Connectez-vous à votre compte pour continuer</p>
          </div>

          {error && (
            <div className='mb-6'>
              <Alert variant='danger'>
                {error}
              </Alert>
            </div>
          )}

          <form onSubmit={handleLogin} className='space-y-5'>
            {/* Email */}
            <div>
              <label className='block text-sm font-semibold text-white mb-2'>Email</label>
              <div className='relative'>
                <Icon name='mail' className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size='sm' />
                <InputText
                  type='email'
                  placeholder='votre@email.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='pl-10 bg-white/10 border-white/20 text-white placeholder-slate-400'
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className='block text-sm font-semibold text-white mb-2'>Mot de passe</label>
              <div className='relative'>
                <Icon name='lock' className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size='sm' />
                <InputText
                  type='password'
                  placeholder='••••••••'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='pl-10 bg-white/10 border-white/20 text-white placeholder-slate-400'
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className='flex items-center gap-3 pt-2'>
              <input
                type='checkbox'
                id='remember'
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className='w-4 h-4 rounded border-white/30 bg-white/10 text-blue-600 cursor-pointer'
              />
              <label htmlFor='remember' className='text-sm text-slate-400 cursor-pointer'>
                Se souvenir de moi
              </label>
            </div>

            {/* Bouton Connexion */}
            <Button
              type='submit'
              variant='primary'
              size='lg'
              fullWidth
              loading={loading}
              className='mt-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold'
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>

            {/* Divider */}
            <div className='relative my-6'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-white/20'></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-white/5 text-slate-400'>ou continuez avec</span>
              </div>
            </div>

            {/* Boutons Sociaux */}
            <div className='grid grid-cols-2 gap-3'>
              <Button
                variant='outline'
                className='border-white/20 text-white hover:bg-white/10 flex items-center justify-center gap-2'
              >
                <Icon name='github' size='sm' />
                <span>GitHub</span>
              </Button>
              <Button
                variant='outline'
                className='border-white/20 text-white hover:bg-white/10 flex items-center justify-center gap-2'
              >
                <Icon name='mail' size='sm' />
                <span>Google</span>
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className='text-center text-slate-400 text-sm'>
          <p>Pas encore de compte?{' '}
            <Link to='/register' className='text-blue-400 hover:text-blue-300 font-semibold transition-colors'>
              S'inscrire
            </Link>
          </p>
        </div>

        {/* Forgot Password */}
        <div className='text-center mt-4'>
          <Link to='/forgot-password' className='text-slate-400 hover:text-slate-300 text-sm transition-colors'>
            Mot de passe oublié?
          </Link>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none'></div>
    </div>
  );
}
