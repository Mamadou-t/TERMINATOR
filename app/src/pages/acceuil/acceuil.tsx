import { useEffect, useMemo, useState } from 'react'
import { Alert, Card, Icon, Loading } from '~/src/components'
import { useAuth } from '~/src/context/AuthContext'
import { listerProjets } from '~/src/services/demarrageApi'
import { formatApiError } from '~/src/lib/api'
import type { Projet } from '~/src/types'

const formatBudget = (value?: number) =>
  value != null ? `${value.toLocaleString('fr-FR')} XOF` : 'À définir'

const salutation = () => {
  const heure = new Date().getHours()
  if (heure < 12) return 'Bonjour'
  if (heure < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

export default function Acceuil() {
  const { utilisateur } = useAuth()

  const [projets, setProjets] = useState<Projet[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    listerProjets()
      .then((rows) => {
        if (!cancelled) setProjets(rows)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(formatApiError(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const kpis = useMemo(() => ({
    total: projets.length,
    enCours: projets.filter((p) => p.statut_projet === 'En cours').length,
    termines: projets.filter((p) => p.statut_projet === 'Terminé').length,
    budgetCumule: projets.reduce((sum, p) => sum + (p.budget_total || 0), 0)
  }), [projets])

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {salutation()}{utilisateur?.prenom ? `, ${utilisateur.prenom}` : ''}
        </h1>
        <p className="mt-1 text-sm capitalize text-slate-600">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {loadError && <Alert variant="warning" title="Données locales" message={loadError} />}

      {loading ? (
        <Loading message="Chargement des projets..." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card hover>
              <div className="flex items-center gap-4">
                <div className="h-10 w-1 rounded-full bg-blue-500" />
                <div>
                  <p className="text-3xl font-semibold text-slate-900">{kpis.total}</p>
                  <p className="text-sm text-slate-600">Total projets</p>
                </div>
              </div>
            </Card>
            <Card hover>
              <div className="flex items-center gap-4">
                <div className="h-10 w-1 rounded-full bg-green-500" />
                <div>
                  <p className="text-3xl font-semibold text-slate-900">{kpis.enCours}</p>
                  <p className="text-sm text-slate-600">En cours</p>
                </div>
              </div>
            </Card>
            <Card hover>
              <div className="flex items-center gap-4">
                <div className="h-10 w-1 rounded-full bg-slate-400" />
                <div>
                  <p className="text-3xl font-semibold text-slate-900">{kpis.termines}</p>
                  <p className="text-sm text-slate-600">Terminés</p>
                </div>
              </div>
            </Card>
            <Card hover>
              <div className="flex items-center gap-4">
                <div className="h-10 w-1 rounded-full bg-amber-500" />
                <div>
                  <p className="text-xl font-semibold text-slate-900">{formatBudget(kpis.budgetCumule)}</p>
                  <p className="text-sm text-slate-600">Budget cumulé</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Icon name="folder" size="lg" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Vos projets</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Retrouvez et ouvrez vos projets et sous-projets depuis l'arborescence "PROJETS" dans la barre latérale.
              Utilisez le bouton + pour en créer un nouveau.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
