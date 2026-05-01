import React, { useState } from "react";
import { Icon } from "../components";
import { Link, useParams, useLocation, Outlet } from "react-router";

type Props = {}

export default function Layout() {
    const [expandedProjects, setExpandedProjects] = useState<{ [key: string]: boolean }>({});
    const { projetId } = useParams();
    const location = useLocation();

    // Chemin de base pour les phases
    const basePath = projetId ? `/projet/${projetId}` : '';

    // Configuration des phases avec leurs pages
    const phaseLinks = {
        demarrage: {
            label: 'Démarrage',
            path: `${basePath}/Demarrage`,
        },
        planification: {
            label: 'Planification',
            path: `${basePath}/Planification`,
        },
        execution: {
            label: 'Exécution',
            path: `${basePath}/Execution`,
        },
        surveillance: {
            label: 'Surveillance et maîtrise',
            path: `${basePath}/Surveillance`,
        },
        cloture: {
            label: 'Clôture',
            path: `${basePath}/Cloture`,
        }
    };

    const projects = [
        {
            id: '1',
            name: 'Batiment Cocody',
            phases: ['demarrage', 'planification', 'execution', 'surveillance', 'cloture']
        },
    ];

    const toggleProject = (projectId: string) => {
        setExpandedProjects(prev => ({
            ...prev,
            [projectId]: !prev[projectId]
        }));
    };

    // Vérifie si une phase est active
    const isPhaseActive = (phaseKey: string) => {
        const phasePath = phaseLinks[phaseKey as keyof typeof phaseLinks].path;
        return location.pathname === phasePath;
    };


    const phaseNames = {
        demarrage: 'Démarrage',
        planification: 'Planification',
        execution: 'Exécution',
        surveillance: 'Surveillance et maîtrise',
        cloture: 'Clôture'
    };
    return (
        <div className="flex  bg-[#f1f3f7] w-screen h-screen">
            <div className="bg-[#1e3a5f] w-1/6 h-full flex flex-col pr-2">
                <div className="border-b-2 border-b-[#ffffff17] pt-2 pl-3 pb-5">
                    <p className="text-white text-[3vh]">TERMINATOR</p>
                    <p className="text-[#ffffff61] text-[10px]">Gestion de projets</p>
                </div>

                {/* div de la naviagation */}
                <div className="pl-3 pt-5 pb-4">
                    <div className="pb-2">
                        <p className=" text-[2vh] text-[#ffffff61] ">NAVIGATION</p>
                    </div>
                    <div className="pl-2 space-y-1">
                        <div className="text-white cursor-pointer hover:bg-[#ffffff10] px-2 py-1 rounded-md transition-all duration-200 hover:text-white group">
                            <Link to={`${basePath}/Dashboard`}>
                                <div className="flex items-center">
                                    <Icon name="dashboard" className="mr-2 text-[#ffffff60] group-hover:text-white transition-colors duration-200" size="sm" />
                                    Tableau de bord
                                </div>
                            </Link>
                        </div>
                        <div className="text-white cursor-pointer hover:bg-[#ffffff10] px-2 py-1 rounded-md transition-all duration-200 hover:text-white group">
                            <div className="flex items-center">
                                <Icon name="portfolio" className="mr-2 text-[#ffffff60] group-hover:text-white transition-colors duration-200" size="sm" />
                                Portefeuille
                            </div>
                        </div>
                    </div>
                </div>

                {/* PARTIE POUR LES PROJETS */}
                <div className="pl-3 pt-5 overflow-y-auto flex-1">
                    <div className="pb-2">
                        <p className=" text-[2vh] text-[#ffffff61]">PROJET ACTIF</p>
                    </div>
                    <div className="space-y-1">
                        {projects.map((project) => (
                            <div key={project.id} className="text-white">
                                {/* Projet principal */}
                                <div
                                    className="flex items-center justify-between cursor-pointer hover:bg-[#ffffff15] px-3 py-2 rounded-md transition-all duration-200 group"
                                    onClick={() => toggleProject(project.id)}
                                >
                                    <span className="text-sm group-hover:text-white transition-colors duration-200">{project.name}</span>
                                    <div className={`transform transition-transform duration-200 ${expandedProjects[project.id] ? 'rotate-90' : ''}`}>
                                        <Icon name="chevron-right" className="text-[#ffffff80] group-hover:text-white transition-colors duration-200" size="sm" />
                                    </div>
                                </div>

                                {/* Phases du projet */}
                                {expandedProjects[project.id] && (
                                    <div className="ml-4 mt-1 space-y-1">
                                        {project.phases.map((phaseKey) => {
                                            const isActive = isPhaseActive(phaseKey);
                                            return (
                                                <Link
                                                    key={phaseKey}
                                                    to={phaseLinks[phaseKey as keyof typeof phaseLinks].path}
                                                    className={`flex items-center justify-between cursor-pointer px-3 py-1.5 rounded-md transition-all duration-200 group ml-2 text-xs ${
                                                        isActive
                                                            ? 'bg-[#ffffff20] text-white'
                                                            : 'text-[#ffffffcc] hover:bg-[#ffffff10] hover:text-white'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {isActive && (
                                                            <Icon name="check" className="text-white" size="xs" />
                                                        )}
                                                        <span className="transition-colors duration-200">
                                                            {phaseLinks[phaseKey as keyof typeof phaseLinks].label}
                                                        </span>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <div className="col-auto w-5/6 h-full flex flex-col">
                {/* barre en haut */}
                <div className="flex w-full h-[7vh] bg-white justify-between">
                    <div className="flex justify-between w-1/4 items-center px-5">Projet/{projects[0]?.name || 'Nom du projet'}</div>
                    <div className="flex justify-between w-1/4 items-center px-5 ">
                        {/* PHASE DU PROJET - DYNAMIQUE */}
                        {(() => {
                            const activePhase = Object.entries(phaseLinks).find(
                                ([_, phase]) => location.pathname === phase.path
                            );
                            const phaseNum = Object.keys(phaseLinks).indexOf(activePhase?.[0] || '') + 1;
                            
                            return (
                                <div className="flex items-center gap-2 bg-blue-50 border border-blue-300 rounded-full px-3 py-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                    <span className="text-xs font-semibold text-blue-900">
                                        Phase {phaseNum} — {activePhase?.[1].label || 'Accueil'}
                                    </span>
                                </div>
                            );
                        })()}

                        <div className="border-[0.5px] border-gray-400 rounded-md p-1">
                            <Icon name="bell" />
                        </div>

                        <div>
                            <Icon name="user" />
                        </div>

                    </div>
                </div>
                {/* le font dynamique */}
                <div className="flex-1 w-full overflow-auto p-4">
                    <Outlet />
                </div>


            </div>

        </div>




    )
}