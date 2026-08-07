import { useNavigate, useParams } from 'react-router';
import { PHASES, DEFAULT_PHASE, domainesForPhase, defaultDomaineForPhase } from '../lib/domaines';

interface PhaseRibbonProps {
  projetId: string;
}

export function PhaseRibbon({ projetId }: PhaseRibbonProps) {
  const navigate = useNavigate();
  const { phase, domaine } = useParams();

  // Domaines de connaissance concernés par la phase active (repli sur la
  // phase par défaut si l'on n'est pas encore dans une phase, ex. Dashboard).
  const domaines = domainesForPhase(phase || DEFAULT_PHASE);

  const goTo = (nextPhase: string, nextDomaine: string) => {
    navigate(`/projet/${projetId}/${nextPhase}/${nextDomaine}`);
  };

  // Au changement de phase : garder le domaine courant s'il est concerné par
  // la nouvelle phase, sinon prendre le premier domaine de cette phase.
  const goToPhase = (nextPhase: string) => {
    const allowed = domainesForPhase(nextPhase).map((d) => d.slug);
    const nextDomaine = domaine && allowed.includes(domaine) ? domaine : defaultDomaineForPhase(nextPhase);
    goTo(nextPhase, nextDomaine);
  };

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Onglets Phase */}
      <div className="flex items-center gap-1 px-6 pt-3 overflow-x-auto">
        {PHASES.map((p) => {
          const isActive = phase === p.slug;
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => goToPhase(p.slug)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-t-md border-b-2 transition-colors duration-200 ${
                isActive
                  ? 'border-[#1e3a5f] text-[#1e3a5f]'
                  : 'border-transparent text-gray-500 hover:text-[#1e3a5f]'
              }`}
            >
              <span className="text-sm font-medium">{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Onglets Domaine de connaissance (filtrés selon la phase active) */}
      <div className="flex items-center gap-1 px-6 py-2 border-t border-gray-100 overflow-x-auto bg-gray-50">
        {domaines.map((d) => {
          const isActive = domaine === d.slug;
          return (
            <button
              key={d.slug}
              type="button"
              onClick={() => goTo(phase || DEFAULT_PHASE, d.slug)}
              className={`whitespace-nowrap px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-[#1e3a5f] text-white'
                  : 'text-slate-600 hover:bg-[#1e3a5f10] hover:text-[#1e3a5f]'
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
