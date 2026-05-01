import React, { useEffect, useState } from 'react';
import {
    Button,
    IconButton,
    InputText,
    Modal,
    Card,
    Badge,
    Select,
    Loading,
    Alert,
    CardHeader,
    CardContent,
    CardFooter
} from '../';
import type { Route } from '../../../+types/root';


export default function Dashboard({params}: Route.LoaderArgs) {
    const [selectedProject, setSelectedProject] = useState<any>(null);

  const projects = [
    { id: 1, name: 'Projet Alpha', propritaire: 'John Doe', status: 'En cours', description: 'Refonte complète du site web', budget: '120 000 €', progress: 62 },
    { id: 2, name: 'Projet Beta', propritaire: 'Jane Smith', status: 'Terminé', description: 'Application mobile native', budget: '95 000 €', progress: 100 },
    { id: 3, name: 'Projet Gamma', propritaire: 'Bob Johnson', status: 'En attente', description: 'Migration vers le cloud', budget: '180 000 €', progress: 15 },
    { id: 4, name: 'Projet Delta', propritaire: 'Alice Williams', status: 'En cours', description: 'Système de gestion interne', budget: '75 000 €', progress: 45 },
    { id: 5, name: 'Projet Epsilon', propritaire: 'Charlie Brown', status: 'Terminé', description: 'Plateforme e-commerce', budget: '200 000 €', progress: 100 }
  ]

    useEffect(() => {
        // Récupérer le paramètre project depuis l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('project');

        if (projectId) {
            const project = projects.find(p => p.id.toString() === projectId);
            if (project) {
                setSelectedProject(project);
            }
        }
    }, []);

    const currentProject = selectedProject || projects[0];

    return (
        <div className='col col-auto w-full space-y-6'>
            {/* Project Header */}
            <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-2xl font-bold text-slate-900'>{currentProject.name}</h1>
                        <p className='text-slate-600 mt-1'>{currentProject.description}</p>
                    </div>
                    <Badge variant={
                        currentProject.status === 'En cours' ? 'success' :
                        currentProject.status === 'Terminé' ? 'secondary' :
                        'warning'
                    }>
                        {currentProject.status}
                    </Badge>
                </div>

                <div className='flex items-center gap-6 mt-4'>
                    <div className='flex items-center gap-2'>
                        <span className='text-sm text-slate-500'>Propriétaire:</span>
                        <span className='font-medium'>{currentProject.propritaire}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <span className='text-sm text-slate-500'>Budget:</span>
                        <span className='font-medium'>{currentProject.budget}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <span className='text-sm text-slate-500'>Progression:</span>
                        <span className='font-medium'>{currentProject.progress}%</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className='flex justify-between'>
                <Card hover className='w-1/4 mx-1'>
                    <CardContent className='flex'>
                        <div className='w-[4px] bg-blue-500 rounded-full'></div>
                        <div className='px-4'>
                            <p className='text-3xl font-bold text-slate-900'>{currentProject.tasks}</p>
                            <p className='text-sm text-slate-600'>Total tâches</p>
                        </div>
                    </CardContent>
                </Card>

                <Card hover className='w-1/4 mx-1'>
                    <CardContent className='flex'>
                        <div className='w-[4px] bg-green-500 rounded-full'></div>
                        <div className='px-4'>
                            <p className='text-3xl font-bold text-slate-900'>{currentProject.completedTasks}</p>
                            <p className='text-sm text-slate-600'>Tâches terminées</p>
                        </div>
                    </CardContent>
                </Card>

                <Card hover className='w-1/4 mx-1'>
                    <CardContent className='flex'>
                        <div className='w-[4px] bg-amber-500 rounded-full'></div>
                        <div className='px-4'>
                            <p className='text-3xl font-bold text-slate-900'>{currentProject.tasks - currentProject.completedTasks}</p>
                            <p className='text-sm text-slate-600'>Tâches restantes</p>
                        </div>
                    </CardContent>
                </Card>

                <Card hover className='w-1/4 mx-1'>
                    <CardContent className='flex'>
                        <div className='w-[4px] bg-purple-500 rounded-full'></div>
                        <div className='px-4'>
                            <p className='text-3xl font-bold text-slate-900'>{currentProject.progress}%</p>
                            <p className='text-sm text-slate-600'>Progression</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className='flex my-5'>
                <div className='w-3/4 h-full'>
                    <Card className='h-full'>
                        <CardHeader>
                            <h4 className='text-lg font-semibold text-slate-900'>Aperçu du projet</h4>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-4'>
                                <div>
                                    <h5 className='font-medium text-slate-900 mb-2'>Équipes impliquées</h5>
                                    <div className='flex gap-2'>
                                        <Badge>Équipe développement</Badge>
                                        <Badge>Équipe design</Badge>
                                        <Badge>Équipe QA</Badge>
                                    </div>
                                </div>

                                <div>
                                    <h5 className='font-medium text-slate-900 mb-2'>Dernières activités</h5>
                                    <div className='space-y-2 text-sm text-slate-600'>
                                        <p>• Mise à jour des spécifications techniques</p>
                                        <p>• Revue de code terminée</p>
                                        <p>• Déploiement en pré-production</p>
                                    </div>
                                </div>

                                <div>
                                    <h5 className='font-medium text-slate-900 mb-2'>Prochaines étapes</h5>
                                    <div className='space-y-2 text-sm text-slate-600'>
                                        <p>• Tests d'intégration</p>
                                        <p>• Validation client</p>
                                        <p>• Déploiement en production</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className='w-1/4 pl-2'>
                    <Card className='h-full'>
                        <CardHeader>
                            <h4 className='text-lg font-semibold text-slate-900'>Alertes & informations</h4>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-3'>
                                <Alert variant='warning'>
                                    <strong>Deadline approchante</strong><br />
                                    La livraison est prévue dans 2 semaines.
                                </Alert>

                                <Alert variant='info'>
                                    <strong>Réunion d'équipe</strong><br />
                                    Programmée pour demain à 14h.
                                </Alert>

                                <Alert variant='success'>
                                    <strong>Milestone atteinte</strong><br />
                                    Phase de développement terminée.
                                </Alert>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}