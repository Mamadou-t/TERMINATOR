import React from 'react';
import {
    Card,
    Badge,
    Alert,
    CardHeader,
    CardContent
} from '../';
import { useProjet } from '../../context/ProjetContext';

interface DashboardAlert {
    variant: 'warning' | 'info' | 'success' | 'error';
    title: string;
    message: string;
}

export default function Dashboard({ params }: { params?: Record<string, string | undefined> }) {
    const { projet, charte, partiesPrenantes, activites, risques, livrables, wbs, couts } = useProjet();

    const progress = activites.length > 0
        ? Math.round(activites.reduce((sum, activity) => sum + (activity.progression ?? 0), 0) / activites.length)
        : 0;

    const completedTasks = activites.filter(activity => activity.statut_activite === 'Terminé').length;
    const remainingTasks = activites.length - completedTasks;

    const sponsor = partiesPrenantes.find(p => p.role === 'Sponsor');
    const chefProjet = partiesPrenantes.find(p => p.role === 'Chef projet');
    const proprietaire = chefProjet?.nom_entite || sponsor?.nom_entite || 'À définir';

    const currentProject = {
        id: projet.id_projet,
        name: projet.nom_projet || 'Projet sans nom',
        propritaire: proprietaire,
        status: projet.statut_projet || 'En attente',
        description: projet.description_projet || 'Aucune description',
        budget: projet.budget_total != null ? `${projet.budget_total.toLocaleString('fr-FR')} XOF` : 'À définir',
        progress,
        tasks: activites.length,
        completedTasks,
        remainingTasks,
        risks: risques.length,
        livrables: livrables.length,
        wbs: wbs.length,
        couts: couts.length,
        projectId: params?.projetId || projet.id_projet
    };

    const joursAvantEcheance = projet.date_fin_prevue
        ? Math.ceil((new Date(projet.date_fin_prevue).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;
    const risquesOuverts = risques.filter(r => r.statut_risque === 'Ouvert');

    const alerts: DashboardAlert[] = [];

    if (partiesPrenantes.length === 0) {
        alerts.push({
            variant: 'warning',
            title: 'Parties prenantes manquantes',
            message: "Aucune partie prenante n'a encore été ajoutée pour ce projet."
        });
    }
    if (charte.statut_charte !== 'Approuvé') {
        alerts.push({
            variant: 'warning',
            title: 'Charte non approuvée',
            message: 'La charte du projet doit encore être validée par le sponsor et le chef de projet.'
        });
    }
    if (projet.statut_projet !== 'Terminé' && joursAvantEcheance != null && joursAvantEcheance < 0) {
        alerts.push({
            variant: 'error',
            title: 'Échéance dépassée',
            message: `La date de fin prévue (${projet.date_fin_prevue}) est dépassée.`
        });
    } else if (projet.statut_projet !== 'Terminé' && joursAvantEcheance != null && joursAvantEcheance <= 14) {
        alerts.push({
            variant: 'warning',
            title: 'Échéance proche',
            message: `Le projet doit se terminer dans ${joursAvantEcheance} jour(s) (${projet.date_fin_prevue}).`
        });
    }
    if (risquesOuverts.length > 0) {
        alerts.push({
            variant: 'warning',
            title: 'Risques ouverts',
            message: `${risquesOuverts.length} risque(s) encore ouvert(s) à traiter.`
        });
    }
    if (alerts.length === 0) {
        alerts.push({
            variant: 'success',
            title: 'Tout est en ordre',
            message: 'Aucune alerte pour le moment sur ce projet.'
        });
    }

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
                        <div className='w-1 bg-blue-500 rounded-full'></div>
                        <div className='px-4'>
                            <p className='text-3xl font-bold text-slate-900'>{currentProject.tasks}</p>
                            <p className='text-sm text-slate-600'>Total tâches</p>
                        </div>
                    </CardContent>
                </Card>

                <Card hover className='w-1/4 mx-1'>
                    <CardContent className='flex'>
                        <div className='w-1 bg-green-500 rounded-full'></div>
                        <div className='px-4'>
                            <p className='text-3xl font-bold text-slate-900'>{currentProject.completedTasks}</p>
                            <p className='text-sm text-slate-600'>Tâches terminées</p>
                        </div>
                    </CardContent>
                </Card>

                <Card hover className='w-1/4 mx-1'>
                    <CardContent className='flex'>
                        <div className='w-1 bg-amber-500 rounded-full'></div>
                        <div className='px-4'>
                            <p className='text-3xl font-bold text-slate-900'>{currentProject.remainingTasks}</p>
                            <p className='text-sm text-slate-600'>Tâches restantes</p>
                        </div>
                    </CardContent>
                </Card>

                <Card hover className='w-1/4 mx-1'>
                    <CardContent className='flex'>
                        <div className='w-1 bg-purple-500 rounded-full'></div>
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
                                    <div className='flex flex-wrap gap-2'>
                                        {partiesPrenantes.length > 0 ? partiesPrenantes.map((partie) => (
                                            <Badge key={partie.id_partie_prenante}>{partie.nom_entite}</Badge>
                                        )) : <span className='text-sm text-slate-500'>Aucune partie prenante renseignée.</span>}
                                    </div>
                                </div>

                                <div>
                                    <h5 className='font-medium text-slate-900 mb-2'>Résumé du projet</h5>
                                    <div className='space-y-2 text-sm text-slate-600'>
                                        <p>• WBS : {currentProject.wbs}</p>
                                        <p>• Livrables : {currentProject.livrables}</p>
                                        <p>• Risques : {currentProject.risks}</p>
                                        <p>• Coûts : {currentProject.couts}</p>
                                    </div>
                                </div>

                                <div>
                                    <h5 className='font-medium text-slate-900 mb-2'>Activités récentes</h5>
                                    <div className='space-y-2 text-sm text-slate-600'>
                                        {activites.length > 0 ? activites.slice(0, 3).map((activity) => (
                                            <p key={activity.id_activites}>• {activity.nom_activite} — {activity.statut_activite}</p>
                                        )) : <p>Aucune activité renseignée pour le moment.</p>}
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
                                {alerts.map((alert, index) => (
                                    <Alert key={index} variant={alert.variant} title={alert.title} message={alert.message} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}