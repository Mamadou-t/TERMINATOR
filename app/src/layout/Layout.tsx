import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, Loading, UserMenu } from "../components";
import { useParams, Outlet } from "react-router";
import { ProjetProvider, useProjet } from "../context/ProjetContext";
import { useProjetChain } from "../hooks/useProjetChain";
import { useOnline } from "../hooks/useOnline";
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

function TopBar({ title, onMenu, extra }: { title: string; onMenu: () => void; extra?: ReactNode }) {
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
                {extra}
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

// #24 : pastille d'état réseau (réseau seul → utilisable partout, y compris accueil).
function OfflinePill() {
    const online = useOnline();
    if (online) return null;
    return (
        <div
            className="inline-flex animate-pulse items-center gap-2 rounded-full bg-[#1e3a5f] px-3 py-1 text-xs font-medium text-white shadow-sm ring-1 ring-[#1e3a5f]/20"
            title="Vous êtes hors ligne. Vos modifications sont enregistrées localement et seront synchronisées au retour de la connexion."
        >
            <span className="relative inline-flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E0E6EF] opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#E0E6EF]" />
            </span>
            <span className="whitespace-nowrap">Mode Hors ligne</span>
        </div>
    );
}

// #24 : pastille « à synchroniser » (nécessite le contexte projet → hors accueil).
// À la reconnexion, la synchro se lance automatiquement et la pastille se
// transforme en icône de synchronisation animée jusqu'à la fin.
function SyncPill() {
    const online = useOnline();
    const { offlinePending, saveToBackend, isSaving } = useProjet();
    // Tentative automatique unique à chaque retour en ligne (pas de boucle si échec).
    const autoTried = useRef(false);
    useEffect(() => {
        if (!online) { autoTried.current = false; return; }
        if (offlinePending && !isSaving && !autoTried.current) {
            autoTried.current = true;
            void saveToBackend().catch(() => {});
        }
    }, [online, offlinePending, isSaving, saveToBackend]);

    if (!online || !offlinePending) return null;

    // Synchronisation en cours : la pastille montre l'icône qui tourne.
    if (isSaving) {
        return (
            <div
                className="inline-flex items-center gap-2 rounded-full bg-[#1e3a5f] px-3 py-1 text-xs font-medium text-white"
                title="Synchronisation en cours…"
            >
                <Icon name="sync" size="xs" className="animate-spin" />
                <span className="whitespace-nowrap">Synchronisation…</span>
            </div>
        );
    }

    // En attente / échec : bouton pour (re)lancer la synchro.
    return (
        <button
            type="button"
            onClick={() => { void saveToBackend().catch(() => {}); }}
            title="Des modifications faites hors ligne ne sont pas encore synchronisées. Cliquez pour synchroniser."
            className="inline-flex items-center gap-2 rounded-full bg-[#E0E6EF] px-3 py-1 text-xs font-medium text-[#1e3a5f] hover:bg-[#d4dbe3]"
        >
            <Icon name="sync" size="xs" />
            <span className="whitespace-nowrap">À synchroniser</span>
        </button>
    );
}

function GlobalShell() {
    const [open, setOpen] = useState(false);
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#f1f3f7]">
            <Sidebar open={open} onClose={() => setOpen(false)} />
            <MobileBackdrop open={open} onClose={() => setOpen(false)} />

            <div className="flex h-full min-w-0 flex-1 flex-col">
                <TopBar title="TERMINATOR — Gestion de projets" onMenu={() => setOpen(true)} extra={<OfflinePill />} />
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
    const chain = useProjetChain(projetId);

    const nomProjetAffiche = projet.nom_projet || 'Nouveau projet';
    // Fil d'Ariane : projet de base / ... / projet courant (nom courant frais
    // depuis le contexte, ancêtres depuis la chaîne). Repli sur le nom seul.
    const noms = chain.length
        ? chain.map((p, i) => (i === chain.length - 1 ? nomProjetAffiche : p.nom_projet))
        : [nomProjetAffiche];
    const titre = `Projet : ${noms.join(' / ')}`;

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#f1f3f7]">
            <Sidebar projetId={projetId} open={open} onClose={() => setOpen(false)} />
            <MobileBackdrop open={open} onClose={() => setOpen(false)} />

            <div className="flex h-full min-w-0 flex-1 flex-col">
                <TopBar title={titre} onMenu={() => setOpen(true)} extra={<><SyncPill /><OfflinePill /></>} />

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
