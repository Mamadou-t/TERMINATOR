import React, { useState } from 'react'
import { Badge, InputText, Icon, Button } from '~/src/components'
import { DataTable } from '~/src/components/DataTable';
import { Link } from 'react-router';

export default function Acceuil() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  const projets = [
    { id: 1, name: 'Projet Alpha', propritaire: 'John Doe', status: 'En cours', description: 'Refonte complète du site web', budget: '120 000 €', progress: 62 },
    { id: 2, name: 'Projet Beta', propritaire: 'Jane Smith', status: 'Terminé', description: 'Application mobile native', budget: '95 000 €', progress: 100 },
    { id: 3, name: 'Projet Gamma', propritaire: 'Bob Johnson', status: 'En attente', description: 'Migration vers le cloud', budget: '180 000 €', progress: 15 },
    { id: 4, name: 'Projet Delta', propritaire: 'Alice Williams', status: 'En cours', description: 'Système de gestion interne', budget: '75 000 €', progress: 45 },
    { id: 5, name: 'Projet Epsilon', propritaire: 'Charlie Brown', status: 'Terminé', description: 'Plateforme e-commerce', budget: '200 000 €', progress: 100 }
  ]

  const handleOpenProject = (project: any) => {
    // Rediriger vers le dashboard du projet
    window.location.href = `/projet/${project.id}/Dashboard`;
  }

  return (
    <div className='flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4 py-8'>
      <div className='w-full max-w-6xl h-full space-y-8'>
        {/* Header avec titre */}
        <div className='text-center'>
          <h1 className='text-5xl font-bold text-slate-900'>
            Bienvenue dans TERMINATOR
          </h1>
          <p className='mt-2 text-lg text-slate-600'>Gestion de projets</p>
        </div>

        {/* Search Input */}
        <div className='space-y-2 flex w-full justify-between'>
          <InputText
            placeholder='Rechercher un projet...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='text-center '
          />

          <Button variant='primary' icon='plus'>
            Nouveau projet
          </Button>
        </div>

        {/* Projects Table */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='p-6 border-b border-gray-200'>
            <h2 className='text-xl font-semibold text-slate-900'>Liste des projets</h2>
            <p className='text-sm text-slate-600 mt-1'>Cliquez sur un projet pour l'ouvrir dans le dashboard</p>
          </div>

          <DataTable
            data={projets}
            columns={[
              {
                key: 'name',
                label: 'Nom du projet',
                sortable: true,
                render: (value: string, row: any) => (
                  <div className='flex items-center gap-3'>
                    <div className='h-3 w-3 rounded-full bg-blue-500'></div>
                    <span className='font-medium text-slate-900'>{value}</span>
                  </div>
                )
              },
              {
                key: 'propritaire',
                label: 'Propriétaire',
                sortable: true
              },
              {
                key: 'status',
                label: 'Statut',
                sortable: true,
                render: (value: string) => (
                  <Badge variant={
                    value === 'En cours' ? 'success' :
                      value === 'Terminé' ? 'secondary' :
                        'warning'
                  }>
                    {value}
                  </Badge>
                )
              },
              {
                key: 'description',
                label: 'Description',
                render: (value: string) => (
                  <span className='text-sm text-slate-600 truncate max-w-xs block'>{value}</span>
                )
              },
              {
                key: 'budget',
                label: 'Budget',
                sortable: true
              },
              {
                key: 'progress',
                label: 'Progression',
                sortable: true,
                render: (value: number) => (
                  <div className='flex items-center gap-2'>
                    <div className='w-16 h-2 bg-gray-200 rounded-full'>
                      <div
                        className='h-2 bg-blue-500 rounded-full transition-all duration-300'
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                    <span className='text-sm text-slate-600'>{value}%</span>
                  </div>
                )
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (value: any, row: any) => (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenProject(row);
                    }}
                  >
                    Ouvrir
                    <Icon name='arrow-right' size='sm' className='ml-2' />
                  </Button>
                )
              }
            ]}
            onRowClick={handleOpenProject}
            searchable={false}
            pageSize={10}
          />
        </div>

      </div>
    </div>
  )
}

