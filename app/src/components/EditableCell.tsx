import { useEffect, useState, type ReactNode } from 'react';

export interface EditableCellProps {
  value: string | number;
  onSave: (value: string) => void;
  type?: 'text' | 'number' | 'date';
  placeholder?: string;
  align?: 'left' | 'right' | 'center';
  /** Rendu personnalisé en lecture (ex. montant formaté). */
  display?: (v: string | number) => ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * Cellule éditable en place (#4) : un clic passe en saisie, Entrée/blur
 * enregistre, Échap annule. Réutilisable dans n'importe quel tableau.
 */
export function EditableCell({
  value, onSave, type = 'text', placeholder, align = 'left', display, className = '', disabled = false
}: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ''));

  useEffect(() => { if (!editing) setDraft(String(value ?? '')); }, [value, editing]);

  const alignCls = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  const commit = () => {
    setEditing(false);
    if (draft !== String(value ?? '')) onSave(draft);
  };
  const cancel = () => { setDraft(String(value ?? '')); setEditing(false); };

  if (disabled) {
    return <span className={`block px-1.5 py-0.5 ${alignCls} ${className}`}>{display ? display(value) : (value ?? '—')}</span>;
  }

  if (editing) {
    return (
      <input
        autoFocus
        type={type}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          else if (e.key === 'Escape') cancel();
        }}
        className={`w-full rounded border border-blue-300 bg-white px-1.5 py-0.5 text-sm outline-none focus:ring-1 focus:ring-blue-400 ${alignCls} ${className}`}
      />
    );
  }

  const isEmpty = value === '' || value === null || value === undefined;
  return (
    <span
      role="button"
      tabIndex={0}
      title="Cliquer pour modifier"
      onClick={() => setEditing(true)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); setEditing(true); } }}
      className={`block cursor-text rounded px-1.5 py-0.5 hover:bg-blue-50 ${alignCls} ${isEmpty ? 'italic text-gray-400' : ''} ${className}`}
    >
      {display ? display(value) : (isEmpty ? (placeholder || '—') : String(value))}
    </span>
  );
}
