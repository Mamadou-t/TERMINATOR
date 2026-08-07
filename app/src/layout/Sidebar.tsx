import { Link, useLocation } from 'react-router';
import { Icon, ProjetTreeNav, UserMenu } from '../components';

interface SidebarProps {
  projetId?: string;
}

export function Sidebar({ projetId }: SidebarProps) {
  const location = useLocation();
  const dashboardPath = projetId ? `/projet/${projetId}/Dashboard` : undefined;
  const isDashboardActive = !!dashboardPath && location.pathname === dashboardPath;

  return (
    <div className="bg-[#1e3a5f] w-1/6 h-full flex flex-col pr-2">
      <div className="border-b-2 border-b-[#ffffff17] pt-2 pl-3 pb-5">
        <p className="text-white text-[3vh]">TERMINATOR</p>
        <p className="text-[#ffffff61] text-[10px]">Gestion de projets</p>
      </div>

      {/* Navigation */}
      <div className="pl-3 pt-5 pb-4">
        <div className="pb-2">
          <p className="text-[2vh] text-[#ffffff61]">NAVIGATION</p>
        </div>
        <div className="pl-2 space-y-1">
          {dashboardPath ? (
            <Link to={dashboardPath}>
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
    </div>
  );
}
