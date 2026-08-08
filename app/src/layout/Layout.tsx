import { useState } from "react";
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

function TopBar({ title, onMenu }: { title: string; onMenu: () => void }) {
    return (
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 lg:px-6">
            <div className="flex min-w-0 items-center gap-2">
                <button
                    type="button"
                    onClick={onMenu}
                    className="lg:hidden rounded-md p-1.5 text-slate-600 hover:bg-gray-100"
                    aria-label="Ouvrir le menu"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <p className="min-w-0 truncate text-sm font-medium text-slate-900 sm:text-base" title={title}>{title}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
                <div className="hidden rounded-md border border-gray-400 p-1 sm:block">
                    <Icon name="bell" />
                </div>
                <UserMenu />
            </div>
        </div>
    );
}

function MobileBackdrop({ open, onClose }: { open: boolean; onClose: () => void }) {
    if (!open) return null;
    return <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />;
}

function GlobalShell() {
    const [open, setOpen] = useState(false);
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#f1f3f7]">
            <Sidebar open={open} onClose={() => setOpen(false)} />
            <MobileBackdrop open={open} onClose={() => setOpen(false)} />

            <div className="flex h-full min-w-0 flex-1 flex-col">
                <TopBar title="TERMINATOR — Gestion de projets" onMenu={() => setOpen(true)} />
                <div className="relative min-h-0 w-full flex-1 overflow-auto p-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

function InProjectShell({ projetId }: { projetId: string }) {
    const [open, setOpen] = useState(false);
    const { projet, isLoadingProjet } = useProjet();

    const nomProjetAffiche = projet.nom_projet || 'Nouveau projet';

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#f1f3f7]">
            <Sidebar projetId={projetId} open={open} onClose={() => setOpen(false)} />
            <MobileBackdrop open={open} onClose={() => setOpen(false)} />

            <div className="flex h-full min-w-0 flex-1 flex-col">
                <TopBar title={`Projet / ${nomProjetAffiche.toUpperCase()}`} onMenu={() => setOpen(true)} />

                {/* ruban Phase -> Domaine de connaissance */}
                <PhaseRibbon projetId={projetId} />

                {/* le fond dynamique */}
                <div className="relative min-h-0 w-full flex-1 overflow-auto p-4">
                    {isLoadingProjet && <Loading fullScreen message="Chargement..." />}
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
