import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Icon } from './';
import { useAuth } from '../context/AuthContext';

interface UserMenuProps {
  variant?: 'topbar' | 'sidebar';
}

export function UserMenu({ variant = 'topbar' }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { utilisateur, deconnexion } = useAuth();

  const handleDeconnexion = async () => {
    setIsOpen(false);
    await deconnexion();
    navigate('/login');
  };

  if (variant === 'sidebar') {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[#ffffffcc] hover:bg-[#ffffff10] hover:text-white transition-all duration-200"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ffffff20]">
            <Icon name="user" size="xs" />
          </div>
          <span className="flex-1 min-w-0 truncate text-left text-xs">{utilisateur?.prenom || 'Profil'}</span>
          <Icon name="chevron-down" size="xs" className="shrink-0" />
        </button>

        {isOpen && (
          <div className="absolute left-0 bottom-full mb-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg z-10">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-medium text-slate-900">
                {utilisateur?.prenom} {utilisateur?.nom}
              </p>
              <p className="text-xs text-slate-500 truncate">{utilisateur?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleDeconnexion}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <Icon name="x-circle" size="sm" />
              Deconnexion
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-100 transition-colors duration-200"
      >
        <Icon name="user" />
        <span className="text-sm text-slate-700">{utilisateur?.prenom}</span>
        <Icon name="chevron-down" size="xs" className="text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg z-10">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-slate-900">
              {utilisateur?.prenom} {utilisateur?.nom}
            </p>
            <p className="text-xs text-slate-500 truncate">{utilisateur?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleDeconnexion}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
          >
            <Icon name="x-circle" size="sm" />
            Deconnexion
          </button>
        </div>
      )}
    </div>
  );
}
