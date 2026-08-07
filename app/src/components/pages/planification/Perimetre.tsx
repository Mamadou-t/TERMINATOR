import { useMemo, useState } from 'react';
import { Card, CardContent, CardFooter } from '../../Card';
import { Button, IconButton } from '../..';
import { useProjet } from '../../../context/ProjetContext';
import { creerOuMajPerimetre } from '../../../services/planificationApi';
import { formatApiError } from '../../../lib/api';
import { useNotification } from '../../../hooks/useNotification';

interface PerimetrePoint {
    id: string;
    titre: string;
    sousPoints: string[];
}

const parsePoints = (raw: string): PerimetrePoint[] => {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed
                .filter((p) => p && typeof p === 'object')
                .map((p, i) => ({
                    id: String(p.id ?? `pt-${i}`),
                    titre: String(p.titre ?? ''),
                    sousPoints: Array.isArray(p.sousPoints) ? p.sousPoints.map((s: unknown) => String(s)) : []
                }));
        }
    } catch {
        // Rétrocompatibilité : ancien texte libre -> un grand point sans titre.
        const lignes = raw.split('\n').map((l) => l.trim()).filter(Boolean);
        return lignes.length ? [{ id: 'legacy', titre: '', sousPoints: lignes }] : [];
    }
    return [];
};

const serializePoints = (points: PerimetrePoint[]): string => JSON.stringify(points);

const uid = () => `pt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function PointsEditor({
    points,
    onChange,
    accent
}: {
    points: PerimetrePoint[];
    onChange: (next: PerimetrePoint[]) => void;
    accent: 'emerald' | 'red';
}) {
    const dot = accent === 'emerald' ? 'bg-emerald-500' : 'bg-red-500';

    const addGrandPoint = () => onChange([...points, { id: uid(), titre: '', sousPoints: [] }]);
    const removeGrandPoint = (id: string) => onChange(points.filter((p) => p.id !== id));
    const updateTitre = (id: string, titre: string) => onChange(points.map((p) => (p.id === id ? { ...p, titre } : p)));

    const addSousPoint = (id: string) => onChange(points.map((p) => (p.id === id ? { ...p, sousPoints: [...p.sousPoints, ''] } : p)));
    const updateSousPoint = (id: string, idx: number, value: string) =>
        onChange(points.map((p) => (p.id === id ? { ...p, sousPoints: p.sousPoints.map((s, i) => (i === idx ? value : s)) } : p)));
    const removeSousPoint = (id: string, idx: number) =>
        onChange(points.map((p) => (p.id === id ? { ...p, sousPoints: p.sousPoints.filter((_, i) => i !== idx) } : p)));

    return (
        <div className="space-y-2.5">
            {points.length === 0 && (
                <p className="text-xs text-gray-500">Aucun grand point pour l'instant.</p>
            )}
            {points.map((point) => (
                <div key={point.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className={`h-6 w-1 rounded ${dot} shrink-0`} />
                        <input
                            value={point.titre}
                            onChange={(e) => updateTitre(point.id, e.target.value)}
                            placeholder="Grand point (ex. Travaux préparatoires)"
                            className="flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm font-semibold text-gray-900 outline-none focus:border-gray-200 focus:bg-gray-50"
                        />
                        <IconButton variant="danger" size="sm" icon="delete" tooltip="Supprimer ce point" onClick={() => removeGrandPoint(point.id)} />
                    </div>

                    <div className="mt-2 space-y-1.5 pl-3.5">
                        {point.sousPoints.map((sp, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <span className={`h-1.5 w-1.5 rounded-full ${dot} shrink-0`} />
                                <input
                                    value={sp}
                                    onChange={(e) => updateSousPoint(point.id, idx, e.target.value)}
                                    placeholder="Sous-point"
                                    className="flex-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                                />
                                <IconButton variant="secondary" size="sm" icon="x" tooltip="Supprimer" onClick={() => removeSousPoint(point.id, idx)} />
                            </div>
                        ))}
                        <Button variant="ghost" size="sm" icon="plus" onClick={() => addSousPoint(point.id)}>
                            Ajouter un sous-point
                        </Button>
                    </div>
                </div>
            ))}

            <Button variant="secondary" size="sm" icon="plus" onClick={addGrandPoint}>
                Ajouter un grand point
            </Button>
        </div>
    );
}

export default function Perimetre() {
    const { perimetre, projet, data, setData } = useProjet();
    const [isSaving, setIsSaving] = useState(false);
    const { notifySuccess, notifyError, NotificationToast } = useNotification();

    const inclus = useMemo(() => parsePoints(perimetre.inclusions_perimetre), [perimetre.inclusions_perimetre]);
    const exclus = useMemo(() => parsePoints(perimetre.exclusions_perimetre), [perimetre.exclusions_perimetre]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await creerOuMajPerimetre(perimetre, projet.id_projet);
            setData({ ...data, perimetre: result });
            notifySuccess('Périmètre enregistré.');
        } catch (err) {
            notifyError(formatApiError(err));
        } finally {
            setIsSaving(false);
        }
    };

    const updateField = (patch: Partial<typeof perimetre>) => {
        setData({ ...data, perimetre: { ...perimetre, ...patch } });
    };

    return (
        <div className='w-full h-full flex flex-col bg-gray-50'>
            <div className="flex-1 overflow-auto p-6 space-y-5">
                {NotificationToast}

                <Card>
                    <CardContent>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Énoncé du périmètre</label>
                                <textarea
                                    value={perimetre.enonce_perimetre}
                                    onChange={(e) => updateField({ enonce_perimetre: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                                    rows={3}
                                    placeholder="Résumé de ce que le projet livre"
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                    <div className="flex items-center justify-between border-b border-gray-200 bg-emerald-50 px-4 py-2.5">
                                        <h3 className="text-sm font-semibold text-emerald-700">CE QUI EST INCLUS (IN SCOPE)</h3>
                                        <span className="text-xs font-medium text-emerald-700">{inclus.length} point{inclus.length > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="p-3">
                                        <PointsEditor
                                            points={inclus}
                                            onChange={(next) => updateField({ inclusions_perimetre: serializePoints(next) })}
                                            accent="emerald"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                    <div className="flex items-center justify-between border-b border-gray-200 bg-red-50 px-4 py-2.5">
                                        <h3 className="text-sm font-semibold text-red-700">CE QUI EST EXCLUS (OUT OF SCOPE)</h3>
                                        <span className="text-xs font-medium text-red-700">{exclus.length} point{exclus.length > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="p-3">
                                        <PointsEditor
                                            points={exclus}
                                            onChange={(next) => updateField({ exclusions_perimetre: serializePoints(next) })}
                                            accent="red"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Contraintes</label>
                                <textarea
                                    value={perimetre.contraintes}
                                    onChange={(e) => updateField({ contraintes: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                                    rows={3}
                                    placeholder="Budget, délai, infrastructure, réglementation, etc."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Hypothèses</label>
                                <textarea
                                    value={perimetre.hypotheses}
                                    onChange={(e) => updateField({ hypotheses: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                                    rows={3}
                                    placeholder="Suppositions acceptées comme vraies (disponibilité, ressources, données, etc.)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Critères de réussite du projet</label>
                                <textarea
                                    value={perimetre.criteres_acceptation}
                                    onChange={(e) => updateField({ criteres_acceptation: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                                    rows={3}
                                    placeholder="Conditions à remplir pour considérer le projet comme réussi"
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className='flex justify-end'>
                        <Button onClick={handleSave} loading={isSaving}>Enregistrer</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
