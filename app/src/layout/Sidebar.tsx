import { Link, useLocation } from 'react-router';
import { Icon, ProjetTreeNav, UserMenu } from '../components';

interface SidebarProps {
  projetId?: string;
  /** Ouverture du tiroir sur mobile (ignoré en desktop où la sidebar est fixe). */
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ projetId, open = false, onClose }: SidebarProps) {
  const location = useLocation();
  const dashboardPath = projetId ? `/projet/${projetId}/Dashboard` : undefined;
  const isDashboardActive = !!dashboardPath && location.pathname === dashboardPath;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85%] flex-col bg-[#1e3a5f] pr-2 shadow-xl transition-transform duration-200 lg:static lg:z-auto lg:w-1/6 lg:max-w-none lg:translate-x-0 lg:shadow-none ${open ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex items-start justify-between border-b-2 border-b-[#ffffff17] pt-2 pl-3 pr-2 pb-4">
        <div>
          <p className="text-2xl font-semibold text-white">TERMINATOR</p>
          <p className="text-[10px] text-[#ffffff61]">Gestion de projets</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden rounded-md p-1 text-[#ffffffaa] hover:bg-[#ffffff10] hover:text-white"
          aria-label="Fermer le menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <div className="pl-3 pt-4 pb-4">
        <div className="pb-2">
          <p className="text-xs font-medium tracking-wide text-[#ffffff61]">NAVIGATION</p>
        </div>
        <div className="pl-2 space-y-1">
          {dashboardPath ? (
            <Link to={dashboardPath} onClick={onClose}>
              <div
                className={`flex items-center px-2 py-1 rounded-md transition-all duration-200 group ${
                  isDashboardActive ? 'bg-[#ffffff20] text-white' : 'text-white hover:bg-[#ffffff10]'
                }`}
              >
                <Icon name="dashboard" className="mr-2 text-[#ffffff60] group-hover:text-white transition-colors duration-200" size="sm" />
                Tableau de bord
              </div>
            </Link>
          ) : (
            <div className="flex items-center px-2 py-1 rounded-md text-[#ffffff40] cursor-not-allowed">
              <Icon name="dashboard" className="mr-2" size="sm" />
              Tableau de bord
            </div>
          )}
          <div className="text-white cursor-pointer hover:bg-[#ffffff10] px-2 py-1 rounded-md transition-all duration-200 hover:text-white group">
            <div className="flex items-center">
              <Icon name="portfolio" className="mr-2 text-[#ffffff60] group-hover:text-white transition-colors duration-200" size="sm" />
              Portefeuille
            </div>
          </div>
        </div>
      </div>

      {/* Arbre des projets */}
      <ProjetTreeNav activeProjetId={projetId} />

      {/* Bas de sidebar : profil et paramètres */}
      <div className="pl-3 pr-2 pt-2 pb-3 border-t border-t-[#ffffff17] space-y-1">
        <UserMenu variant="sidebar" />
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[#ffffffcc] hover:bg-[#ffffff10] hover:text-white transition-all duration-200"
        >
          <Icon name="settings" size="xs" />
          <span className="text-xs">Paramètres</span>
        </button>
      </div>
    </aside>
  );
}
