import { useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { Icon, KpiCard, ProcessusNav } from '~/src/components';
import { findDomaine, findPhase, defaultDomaineForPhase, processusForDomaine } from '~/src/lib/domaines';
import { useDomaineInfo } from '~/src/lib/domaineInfo';

export default function PhaseDomainePage() {
    const { projetId, phase, domaine } = useParams();
    const phaseDef = findPhase(phase);

    // Domaine non concerné par la phase (URL directe) : on redirige vers le
    // premier domaine autorisé de la phase.
    if (domaine && !phaseDef.domaines.includes(domaine)) {
        return <Navigate to={`/projet/${projetId}/${phaseDef.slug}/${defaultDomaineForPhase(phaseDef.slug)}`} replace />;
    }

    const domaineDef = findDomaine(domaine);
    const processus = processusForDomaine(domaine, phaseDef.slug);
    // La clé remonte l'état du processus actif quand on change de domaine/phase.
    return <DomaineAvecProcessus key={`${phaseDef.slug}-${domaineDef.slug}`} domaineDef={domaineDef} processus={processus} />;
}

function DomaineAvecProcessus({
    domaineDef,
    processus
}: {
    domaineDef: ReturnType<typeof findDomaine>;
    processus: string[];
}) {
    const [activeProcessus, setActiveProcessus] = useState(0);
    const info = useDomaineInfo(domaineDef.slug);
    const Contenu = domaineDef.component;

    return (
        <div className="flex h-full w-full flex-col bg-gray-50">
            {/* KPI du domaine (au-dessus des processus, indépendants du
                processus sélectionné). */}
            {info.kpis.length > 0 && (
                <div className="bg-white px-6 pt-5 pb-4">
                    <div className={`grid grid-cols-1 gap-3 ${info.kpis.length >= 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
                        {info.kpis.map((kpi, i) => (
                            <KpiCard key={i} value={kpi.value} label={kpi.label} barColor={kpi.barColor} valueClassName={kpi.valueClassName} />
                        ))}
                    </div>
                </div>
            )}

            {/* Barre de processus affichée seulement s'il y a plusieurs
                processus (un processus seul n'apporte rien). */}
            {processus.length > 1 && (
                <div className="bg-white">
                    <ProcessusNav processus={processus} activeIndex={activeProcessus} onSelect={setActiveProcessus} />
                </div>
            )}

            <div className="flex-1 overflow-auto">
                {/* Domaine géré par processus : le composant reçoit le processus
                    actif et rend l'outil correspondant. Sinon, le 1er processus
                    porte l'outil et les autres sont « à venir ». */}
                {domaineDef.perProcessus || activeProcessus === 0 ? (
                    <Contenu processus={processus[activeProcessus]} />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-12 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <Icon name="clock" size="lg" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">{processus[activeProcessus]}</h3>
                        <p className="max-w-sm text-sm text-slate-600">Ce processus sera outillé prochainement.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
