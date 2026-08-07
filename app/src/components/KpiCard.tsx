interface KpiCardProps {
  /** Valeur mise en avant (nombre ou texte court). */
  value: React.ReactNode;
  /** Libellé sous la valeur. */
  label: string;
  /** Classe de couleur de la barre latérale (ex. 'bg-blue-600'). */
  barColor?: string;
  /** Classe optionnelle sur la valeur (ex. 'text-red-600'). */
  valueClassName?: string;
}

/**
 * Carte KPI au style de la page Parties prenantes : fine barre colorée à
 * gauche, valeur en gras, libellé discret.
 */
export function KpiCard({ value, label, barColor = 'bg-[#1e3a5f]', valueClassName = 'text-gray-900' }: KpiCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <div className={`h-8 w-0.5 rounded ${barColor}`} />
      <div className="min-w-0">
        <div className={`text-xl font-semibold ${valueClassName}`}>{value}</div>
        <div className="text-xs text-gray-600">{label}</div>
      </div>
    </div>
  );
}
