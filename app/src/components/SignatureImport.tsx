import { useRef } from 'react';
import { Button } from './Button';

interface SignatureImportProps {
  /** Signature existante (data URL base64). */
  value?: string;
  /** Appelée avec le data URL de l'image importée, ou '' quand on la retire. */
  onChange: (dataUrl: string) => void;
  height?: number;
}

/**
 * Import d'une image de signature (photo/scan de la signature d'une partie
 * prenante). L'image est convertie en data URL base64 et stockée telle quelle.
 */
export function SignatureImport({ value, onChange, height = 160 }: SignatureImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
    // Réinitialise pour permettre de réimporter le même fichier ensuite.
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center justify-center rounded-md border border-slate-300 bg-white p-2" style={{ height }}>
          <img src={value} alt="Signature" className="h-full w-auto object-contain" />
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-md border border-dashed border-slate-400 bg-slate-50 text-sm text-slate-500" style={{ height }}>
          Aucune signature importée
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
          {value ? 'Changer l\'image' : 'Importer une image'}
        </Button>
        {value && <Button variant="secondary" size="sm" onClick={() => onChange('')}>Retirer</Button>}
      </div>
    </div>
  );
}
