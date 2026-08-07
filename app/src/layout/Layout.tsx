import { Icon, Loading, UserMenu } from "../components";
import { useParams, Outlet } from "react-router";
import { ProjetProvider, useProjet } from "../context/ProjetContext";
import { Sidebar } from "./Sidebar";
import { PhaseRibbon } from "./PhaseRibbon";

export default function Layout() {
    const { projetId } = useParams();

    if (projetId) {
        return (
            <ProjetProvider>
                <InProjectShell projetId={projetId} />
            </ProjetProvider>
        );
    }

    return <GlobalShell />;
}

function GlobalShell() {
    return (
        <div className="flex bg-[#f1f3f7] w-screen h-screen">
            <Sidebar />

            <div className="col-auto w-5/6 h-full flex flex-col">
                <div className="flex h-[7vh] w-full items-center justify-between gap-4 bg-white px-6">
                    <p className="min-w-0 truncate font-medium text-slate-900">TERMINATOR — Gestion de projets</p>
                    <div className="flex shrink-0 items-center gap-4">
                        <div className="rounded-md border border-gray-400 p-1">
                            <Icon name="bell" />
                        </div>
                        <UserMenu />
                    </div>
                </div>

                <div className="relative flex-1 w-full overflow-auto p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

function InProjectShell({ projetId }: { projetId: string }) {
    const { projet, isLoadingProjet } = useProjet();

    const nomProjetAffiche = projet.nom_projet || 'Nouveau projet';

    return (
        <div className="flex bg-[#f1f3f7] w-screen h-screen">
            <Sidebar projetId={projetId} />

            <div className="col-auto w-5/6 h-full flex flex-col">
                {/* barre en haut */}
                <div className="flex h-[7vh] w-full items-center justify-between gap-4 bg-white px-6">
                    <p className="min-w-0 truncate font-medium text-slate-900" title={nomProjetAffiche}>
                        Projet / {nomProjetAffiche.toUpperCase()}
                    </p>
                    <div className="flex shrink-0 items-center gap-4">
                        <div className="rounded-md border border-gray-400 p-1">
                            <Icon name="bell" />
                        </div>
                        <UserMenu />
                    </div>
                </div>

                {/* ruban Phase -> Domaine de connaissance */}
                <PhaseRibbon projetId={projetId} />

                {/* le fond dynamique */}
                <div className="relative flex-1 w-full overflow-auto p-4">
                    {isLoadingProjet && <Loading fullScreen message="Chargement..." />}
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
