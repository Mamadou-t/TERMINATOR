interface DomaineHeaderProps {
  title: string;
  subtitle?: string;
  /** Actions affichées à droite (boutons). */
  actions?: React.ReactNode;
}

/**
 * En-tête standard d'un domaine (titre + sous-titre + actions), au style de
 * la page Parties prenantes.
 */
export function DomaineHeader({ title, subtitle, actions }: DomaineHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
