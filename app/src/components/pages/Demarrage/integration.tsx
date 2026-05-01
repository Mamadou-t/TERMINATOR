import { useState } from 'react';
import Demarrage from './demarrage';
import PartiesPrenantes from './PartiePrenante';
import CharteProjet from './CharteProjet';
import Layout from '~/src/layout/Layout';
import { Button } from '../../Button';

export default function Integration() {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        { id: 0, name: 'Charte du projet', component: <CharteProjet /> },
        { id: 1, name: 'Parties Prenantes', component: <PartiesPrenantes /> }
    ];

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Navigation Band */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {index + 1}
                                </div>
                                <span className={`ml-2 text-sm font-medium ${index <= currentStep ? 'text-[#1e3a5f]' : 'text-gray-500'
                                    }`}>
                                    {step.name}
                                </span>
                                {index < steps.length - 1 && (
                                    <div className={`w-8 h-0.5 mx-4 ${index < currentStep ? 'bg-[#1e3a5f]' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Précédent
                        </button>
                        <button
                            onClick={nextStep}
                            disabled={currentStep === steps.length - 1}
                            className="px-4 py-2 bg-[#1e3a5f] text-white rounded-md hover:bg-[#1e3a5f] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {steps[currentStep].component}
            </div>


            <div className="actions-bar flex items-center justify-end px-6 py-4 border-t border-white">
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button variant='secondary'>Annuler</Button>
                    <Button variant='primary'>Enregistrer</Button>
                </div>
            </div>

        </div>
    );
}