interface ProcessusNavProps {
  processus: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

/**
 * Barre de navigation des processus d'un domaine de connaissance (même style
 * que les onglets de la page Parties prenantes).
 */
export function ProcessusNav({ processus, activeIndex, onSelect }: ProcessusNavProps) {
  if (processus.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-6 border-b border-gray-200 px-6">
      {processus.map((p, index) => (
        <button
          key={p}
          type="button"
          onClick={() => onSelect(index)}
          className={`whitespace-nowrap pb-3 text-sm font-semibold transition-colors ${
            index === activeIndex
              ? 'text-gray-900 border-b-2 border-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
