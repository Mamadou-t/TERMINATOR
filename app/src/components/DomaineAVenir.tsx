import { Icon } from './';

interface DomaineAVenirProps {
  titre: string;
}

export function DomaineAVenir({ titre }: DomaineAVenirProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Icon name="clock" size="lg" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{titre}</h3>
      <p className="max-w-sm text-sm text-slate-600">Ce domaine de connaissance n'est pas encore disponible.</p>
    </div>
  );
}
