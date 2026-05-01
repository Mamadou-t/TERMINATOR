import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../../Card';
import { Alert, Badge, Button, Icon, InputText } from '../..';


export default function Perimetre() {
    const [localisation, setLocalisation] = useState('');
    const [referencesFoncieres, setReferencesFoncieres] = useState('');
    const [superficieTotale, setSuperficieTotale] = useState('');
    const [topographie, setTopographie] = useState('');
    const [natureSol, setNatureSol] = useState('');
    const [accessibilite, setAccessibilite] = useState('');
    const [contraintes, setContraintes] = useState('');

    return (
        <div className='flex '>
            <div className="my-6 mx-2 w-full">
                <div className="space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="text-xl font-semibold text-slate-900">Périmetre du projet</div>
                            <div className="text-sm text-slate-500">Définissez les bases officielles du projet avant de lancer la planification.</div>
                        </div>
                    </div>
                </div>

                <div>
                    <Card className='my-3'>
                        <CardHeader className='flex justify-between'>
                            <div className="text-lg font-medium text-slate-900">
                                <h3>Consistance du projet</h3>
                                <p className='text-sm text-gray-400'>Ce qui est à faire</p>
                            </div>
                            <div>
                                <Button>Ajouter</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Consistance du projet */}
                            <div className=' col-auto'>
                                <div className='py-2'>
                                    <div className='flex items-center gap-2 mb-3'>
                                        <div className='bg-blue-950 p-1 w-1 h-1  rounded-full'></div>
                                        <h3 className='text-xl font-medium text-slate-900'>Objectifs du projet</h3>
                                    </div>
                                    <div className='px-5'>
                                        <p className='text-sm text-gray-500'>Décrivez les objectifs spécifiques que le projet vise à atteindre. Assurez-vous qu'ils sont clairs, mesurables et alignés sur les besoins des parties prenantes.</p>

                                    </div>
                                </div>

                                <div className='py-2'>
                                    <div className='flex items-center gap-2 mb-3'>
                                        <div className='bg-blue-950 p-1 w-1 h-1  rounded-full'></div>
                                        <h3 className='text-xl font-medium text-slate-900'>Objectifs du projet</h3>
                                    </div>
                                    <div className='px-5'>
                                        <p className='text-sm text-gray-500'>Décrivez les objectifs spécifiques que le projet vise à atteindre. Assurez-vous qu'ils sont clairs, mesurables et alignés sur les besoins des parties prenantes.</p>

                                    </div>
                                </div>

                                <div className='py-2'>
                                    <div className='flex items-center gap-2 mb-3'>
                                        <div className='bg-blue-950 p-1 w-1 h-1  rounded-full'></div>
                                        <h3 className='text-xl font-medium text-slate-900'>Objectifs du projet</h3>
                                    </div>
                                    <div className='px-5'>
                                        <p className='text-sm text-gray-500'>Décrivez les objectifs spécifiques que le projet vise à atteindre. Assurez-vous qu'ils sont clairs, mesurables et alignés sur les besoins des parties prenantes.</p>

                                    </div>
                                </div>

                                <div className='py-2'>
                                    <div className='flex items-center gap-2 mb-3'>
                                        <div className='bg-blue-950 p-1 w-1 h-1  rounded-full'></div>
                                        <h3 className='text-xl font-medium text-slate-900'>Objectifs du projet</h3>
                                    </div>
                                    <div className='px-5'>
                                        <p className='text-sm text-gray-500'>Décrivez les objectifs spécifiques que le projet vise à atteindre. Assurez-vous qu'ils sont clairs, mesurables et alignés sur les besoins des parties prenantes.</p>

                                    </div>
                                </div>

                            </div>
                        </CardContent>


                    </Card>

                    <Card className='my-3'>
                        <CardHeader className='flex justify-between'>
                            <div className="text-lg font-medium text-slate-900">
                                <h3>Exclusions contractuelles</h3>
                                <p className='text-sm text-gray-400'>Prestations expressément non comprises au projet</p>
                            </div>
                            <div>
                                <Button>Ajouter</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Exclusions contractuelles */}
                            <div className=' col-auto'>
                                <div className='py-2'>
                                    <div className='flex items-center gap-2 mb-3'>
                                        <div className='bg-blue-950 p-1 w-1 h-1  rounded-full'></div>
                                        <h3 className='text-xl font-medium text-slate-900'>Objectifs du projet</h3>
                                    </div>
                                    <div className='px-5'>
                                        <p className='text-sm text-gray-500'>Décrivez les objectifs spécifiques que le projet vise à atteindre. Assurez-vous qu'ils sont clairs, mesurables et alignés sur les besoins des parties prenantes.</p>

                                    </div>
                                </div>

                                <div className='py-2'>
                                    <div className='flex items-center gap-2 mb-3'>
                                        <div className='bg-blue-950 p-1 w-1 h-1  rounded-full'></div>
                                        <h3 className='text-xl font-medium text-slate-900'>Objectifs du projet</h3>
                                    </div>
                                    <div className='px-5'>
                                        <p className='text-sm text-gray-500'>Décrivez les objectifs spécifiques que le projet vise à atteindre. Assurez-vous qu'ils sont clairs, mesurables et alignés sur les besoins des parties prenantes.</p>

                                    </div>
                                </div>

                                <div className='py-2'>
                                    <div className='flex items-center gap-2 mb-3'>
                                        <div className='bg-blue-950 p-1 w-1 h-1  rounded-full'></div>
                                        <h3 className='text-xl font-medium text-slate-900'>Objectifs du projet</h3>
                                    </div>
                                    <div className='px-5'>
                                        <p className='text-sm text-gray-500'>Décrivez les objectifs spécifiques que le projet vise à atteindre. Assurez-vous qu'ils sont clairs, mesurables et alignés sur les besoins des parties prenantes.</p>

                                    </div>
                                </div>

                                <div className='py-2'>
                                    <div className='flex items-center gap-2 mb-3'>
                                        <div className='bg-blue-950 p-1 w-1 h-1  rounded-full'></div>
                                        <h3 className='text-xl font-medium text-slate-900'>Objectifs du projet</h3>
                                    </div>
                                    <div className='px-5'>
                                        <p className='text-sm text-gray-500'>Décrivez les objectifs spécifiques que le projet vise à atteindre. Assurez-vous qu'ils sont clairs, mesurables et alignés sur les besoins des parties prenantes.</p>

                                    </div>
                                </div>

                            </div>
                        </CardContent>


                    </Card>

                    <Card className='my-3'>
                        <CardHeader className='flex justify-between'>
                            <div className="text-lg font-medium text-slate-900">
                                <h3>Contexte et état d'avancement du projet</h3>
                                <p className='text-sm text-gray-400'>Situation administrative, technique et réglementaire à la date d'établissement</p>
                            </div>
                            <div>
                                <Button>Ajouter</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Exclusions contractuelles */}
                            <div className=' col-auto'>
                                <div className='py-2'>
                                    <div className='flex items-center gap-2 mb-3'>
                                        <div className='bg-blue-950 p-1 w-1 h-1  rounded-full'></div>
                                        <h3 className='text-xl font-medium text-slate-900'>Objectifs du projet</h3>
                                    </div>
                                    <div className='px-5'>
                                        <p className='text-sm text-gray-500'>Décrivez les objectifs spécifiques que le projet vise à atteindre. Assurez-vous qu'ils sont clairs, mesurables et alignés sur les besoins des parties prenantes.</p>

                                    </div>
                                </div>

                                <div className='py-2'>
                                    <div className='flex items-center gap-2 mb-3'>
                                        <div className='bg-blue-950 p-1 w-1 h-1  rounded-full'></div>
                                        <h3 className='text-xl font-medium text-slate-900'>Objectifs du projet</h3>
                                    </div>
                                    <div className='px-5'>
                                        <p className='text-sm text-gray-500'>Décrivez les objectifs spécifiques que le projet vise à atteindre. Assurez-vous qu'ils sont clairs, mesurables et alignés sur les besoins des parties prenantes.</p>

                                    </div>
                                </div>

                                <div className='py-2'>
                                    <div className='flex items-center gap-2 mb-3'>
                                        <div className='bg-blue-950 p-1 w-1 h-1  rounded-full'></div>
                                        <h3 className='text-xl font-medium text-slate-900'>Objectifs du projet</h3>
                                    </div>
                                    <div className='px-5'>
                                        <p className='text-sm text-gray-500'>Décrivez les objectifs spécifiques que le projet vise à atteindre. Assurez-vous qu'ils sont clairs, mesurables et alignés sur les besoins des parties prenantes.</p>

                                    </div>
                                </div>

                                <div className='py-2'>
                                    <div className='flex items-center gap-2 mb-3'>
                                        <div className='bg-blue-950 p-1 w-1 h-1  rounded-full'></div>
                                        <h3 className='text-xl font-medium text-slate-900'>Objectifs du projet</h3>
                                    </div>
                                    <div className='px-5'>
                                        <p className='text-sm text-gray-500'>Décrivez les objectifs spécifiques que le projet vise à atteindre. Assurez-vous qu'ils sont clairs, mesurables et alignés sur les besoins des parties prenantes.</p>

                                    </div>
                                </div>

                            </div>
                        </CardContent>


                    </Card>

                    <Card className='my-3'>
                        <CardHeader className='flex justify-between'>
                            <div className="text-lg font-medium text-slate-900">
                                <h3>Localisation et caractéristiques du site</h3>
                                <p className='text-sm text-gray-400'>Données foncières, physiques et géotechniques du terrain d'assiette</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <div className='flex flex-wrap gap-7'>
                                    <InputText
                                        label="LOCALISATION DU SITE"
                                        placeholder="Cocody Riviera 3, Abidjan, Côte d'Ivoire"
                                        helperText="Maximum 50 caractères"
                                        value={localisation}
                                        onChange={(e) => setLocalisation(e.target.value)}
                                    />

                                    <InputText
                                        label="REFERENCES FONCIERES"
                                        placeholder="TF N° 12345"
                                        helperText="Maximum 50 caractères"
                                        value={referencesFoncieres}
                                        onChange={(e) => setReferencesFoncieres(e.target.value)}
                                    />

                                    <InputText
                                        label="SUPERFICIE TOTALE"
                                        placeholder="1000 m²"
                                        helperText="Maximum 50 caractères"
                                        value={superficieTotale}
                                        onChange={(e) => setSuperficieTotale(e.target.value)}
                                    />

                                    <InputText
                                        label="TOPOGRAPHIE DU SITE"
                                        placeholder="Terrain plat avec légère pente vers le sud"
                                        helperText="Maximum 50 caractères"
                                        value={topographie}
                                        onChange={(e) => setTopographie(e.target.value)}
                                    />

                                    <InputText
                                        label="NATURE DU SOL"
                                        placeholder="Sol argileux"
                                        helperText="Maximum 50 caractères"
                                        value={natureSol}
                                        onChange={(e) => setNatureSol(e.target.value)}
                                    />

                                    <InputText
                                        label="ACCESSIBILITE DU CHANTIER"
                                        placeholder=""
                                        helperText="Maximum 50 caractères"
                                        value={accessibilite}
                                        onChange={(e) => setAccessibilite(e.target.value)}
                                    />

                                </div>

                                <div className='my-5'>
                                    <Card>
                                        <CardHeader>
                                            <h2>CONTRAINTES SPECIFIQUES DU SITE</h2>
                                        </CardHeader>
                                        <CardContent>
                                            <InputText
                                                type='textarea'
                                                value={contraintes}
                                                onChange={(e) => setContraintes(e.target.value)}
                                            />
                                        </CardContent>
                                        <CardFooter>
                                            <div className='flex justify-center bg-gray-50  border-gray-300 border-dashed border   rounded-md  p-3 text-sm text-gray-500'>
                                                <div className='flex flex-col items-center justify-center '>
                                                    <Icon name="map-pin" className="transform rotate-90 my-2" size="sm" />
                                                    <div className='my-5 '>
                                                        <p>Déposer le plan de masse, plan de situation, rapport géotechnique
                                                        </p>
                                                        <p>Formats acceptés : PDF, DWG, DXF, PNG — 50 Mo max par fichier</p>

                                                    </div>
                                                </div>

                                            </div>

                                        </CardFooter>
                                    </Card>
                                </div>
                            </div>
                        </CardContent>


                    </Card>

                </div>

            </div>

            {/* PARTIE PAPIER PREVIEW */}

            {/* <div className="border-l border-gray-200 bg-white flex flex-col overflow-y-auto my-6 mx-2 w-4/12 h-full">
                <div className="w-80 h-96 bg-white border shadow-lg mx-auto p-8 text-sm">
                    <h1 className="text-center text-xl font-bold mb-4">APERÇU CHARTE DU PROJET</h1>
                    
                    <h2 className="text-lg font-semibold mb-2">Consistance du projet</h2>
                    <p className="mb-4">Ce qui est à faire : Objectifs du projet - Décrivez les objectifs spécifiques que le projet vise à atteindre. Assurez-vous qu'ils sont clairs, mesurables et alignés sur les besoins des parties prenantes.</p>
                    
                    <h2 className="text-lg font-semibold mb-2">Exclusions contractuelles</h2>
                    <p className="mb-4">Prestations expressément non comprises au projet : Objectifs du projet - Décrivez les objectifs spécifiques que le projet vise à atteindre. Assurez-vous qu'ils sont clairs, mesurables et alignés sur les besoins des parties prenantes.</p>
                    
                    <h2 className="text-lg font-semibold mb-2">Contexte et état d'avancement du projet</h2>
                    <p className="mb-4">Situation administrative, technique et réglementaire à la date d'établissement : Objectifs du projet - Décrivez les objectifs spécifiques que le projet vise à atteindre. Assurez-vous qu'ils sont clairs, mesurables et alignés sur les besoins des parties prenantes.</p>
                    
                    <h2 className="text-lg font-semibold mb-2">Localisation et caractéristiques du site</h2>
                    <ul className="mb-4">
                        <li><strong>Localisation du site :</strong> {localisation || 'Non saisi'}</li>
                        <li><strong>Références foncières :</strong> {referencesFoncieres || 'Non saisi'}</li>
                        <li><strong>Superficie totale :</strong> {superficieTotale || 'Non saisi'}</li>
                        <li><strong>Topographie du site :</strong> {topographie || 'Non saisi'}</li>
                        <li><strong>Nature du sol :</strong> {natureSol || 'Non saisi'}</li>
                        <li><strong>Accessibilité du chantier :</strong> {accessibilite || 'Non saisi'}</li>
                    </ul>
                    
                    <h3 className="font-semibold mb-2">Contraintes spécifiques du site</h3>
                    <p>{contraintes || 'Non saisi'}</p>
                </div>
            </div> */}

        </div>
    )
}