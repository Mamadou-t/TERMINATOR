export default function CharteProjet() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xl font-semibold text-slate-900">Charte du projet</div>
            <div className="text-sm text-slate-500">Définissez les bases officielles du projet avant de lancer la planification.</div>
          </div>
        </div>
      </div>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="10" height="10" rx="2" stroke="#185FA5" strokeWidth="1.5" />
              <path d="M3 6h6M3 4h4" stroke="#185FA5" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1 text-sm font-semibold text-slate-900">Informations générales</div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-semibold text-emerald-700">Complété</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Nom du projet<span className="text-rose-500">*</span></label>
            <input className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-900 shadow-sm" readOnly value="Refonte SI Ressources Humaines" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Code projet<span className="text-rose-500">*</span></label>
            <input className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-900 shadow-sm" readOnly value="PRJ-2025-047" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Catégorie</label>
            <input className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-900 shadow-sm" readOnly value="Système d'information" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Date de début prévue</label>
            <input className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-900 shadow-sm" readOnly value="01/02/2025" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Date de fin prévue</label>
            <input className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-900 shadow-sm" readOnly value="30/11/2025" />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6" cy="6" r="5" stroke="#185FA5" strokeWidth="1.5" />
              <path d="M6 4v2l1.5 1.5" stroke="#185FA5" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1 text-sm font-semibold text-slate-900">Objectifs & justification</div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold text-amber-800">En cours</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Description du projet<span className="text-rose-500">*</span></label>
            <textarea style={{ minHeight: 140 }} className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm" defaultValue="Modernisation complète du système d'information RH afin d'automatiser les processus de paie, gestion des congés et recrutement. Le projet vise à remplacer les outils legacy par une solution intégrée." />
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-slate-700">Objectifs SMART<span className="text-rose-500">*</span></div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { title: 'S — Spécifique', hint: 'Quel est l\'objectif précis ?', value: 'Déployer un SIRH unifié pour 450 collaborateurs' },
                { title: 'M — Mesurable', hint: 'Comment mesurer le succès ?', value: 'Réduire le temps de traitement paie de 40%' },
                { title: 'A — Atteignable', hint: 'Moyens disponibles ?', placeholder: 'Décrire les ressources allouées...' },
                { title: 'R — Réaliste', hint: 'Alignement stratégique ?', placeholder: 'Lien avec la stratégie de l\'organisation...' },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 text-sm font-semibold text-slate-900">{item.title}</div>
                  <div className="mb-2 text-sm text-slate-600">{item.hint}</div>
                  <input
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm"
                    defaultValue={item.value}
                    placeholder={item.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Bénéfices attendus</label>
            <textarea style={{ minHeight: 55 }} className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm" placeholder="Listez les bénéfices métier, techniques et financiers attendus..." />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Alignement stratégique</label>
              <select className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm">
                <option>Plan stratégique 2025 — Transformation digitale</option>
                <option>Plan RH 2024-2026</option>
                <option>Initiative excellence opérationnelle</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Priorité du projet</label>
              <select className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm">
                <option>Haute — Impact critique</option>
                <option>Moyenne</option>
                <option>Faible</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 1v10M1 6h10" stroke="#185FA5" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-sm font-semibold text-slate-900">Budget initial estimé</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Budget estimé<span className="text-rose-500">*</span></label>
            <div className="flex overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
              <span className="flex items-center bg-slate-100 px-3 text-sm text-slate-600">XOF</span>
              <input className="flex-1 border-none px-4 py-3 text-sm text-slate-900 outline-none" placeholder="0" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Réserve de contingence (%)</label>
            <div className="flex overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
              <input className="flex-1 border-none px-4 py-3 text-sm text-slate-900 outline-none" placeholder="10" />
              <span className="flex items-center bg-slate-100 px-3 text-sm text-slate-600">%</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Source de financement</label>
            <select className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm">
              <option>Budget interne DSI</option>
              <option>Financement externe</option>
              <option>Budget DRH</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6" cy="4" r="2" stroke="#185FA5" strokeWidth="1.5" />
              <path d="M2 11c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5" stroke="#185FA5" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-sm font-semibold text-slate-900">Approbation & validation</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Chef de projet désigné<span className="text-rose-500">*</span></label>
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">AK</div>
              <div>
                <div className="font-semibold text-slate-900">Aya Koné</div>
                <div className="text-sm text-slate-500">Chef de projet Senior — DSI</div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Sponsor du projet<span className="text-rose-500">*</span></label>
            <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-800 text-sm font-semibold text-white">MB</div>
              <div>
                <div className="font-semibold text-slate-900">Marc Bédié</div>
                <div className="text-sm text-slate-500">Directeur Général — DRH</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-slate-700">Workflow d'approbation</div>
          <div className="flex flex-wrap items-center gap-2">
            {['Rédaction CP', 'Revue sponsor', 'Validation DG', 'Signature', 'Approuvé'].map((step, idx) => (
              <div key={step} className={`rounded-3xl border px-4 py-2 text-sm ${idx === 0 ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>
                {step}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Notes de validation</label>
          <textarea style={{ minHeight: 110 }} className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm" placeholder="Commentaires ou conditions d'approbation..." />
          <div className="text-xs text-slate-500">Ces notes seront visibles par tous les approbateurs.</div>
        </div>
      </section>
    </div>
  )
}
