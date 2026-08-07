import { useState } from 'react';
import CharteProjet from './CharteProjet';
import { Button } from '../../Button';
import { Modal, ModalFooter } from '../../Modal';
import { useProjet } from '../../../context/ProjetContext';
import { formatApiError } from '../../../lib/api';
import { useNotification } from '../../../hooks/useNotification';

export default function IntegrationDomaine() {
    const { notifySuccess, notifyError, clearNotification, NotificationToast } = useNotification();
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
    const { isSaving, saveToBackend, reloadFromBackend } = useProjet();

    const handleSave = async () => {
        try {
            await saveToBackend();
            notifySuccess('Modifications enregistrées.');
        } catch (err) {
            notifyError(formatApiError(err));
        }
    };

    const confirmCancel = async () => {
        setIsCancelConfirmOpen(false);
        clearNotification();
        await reloadFromBackend();
    };

    return (
        <div className="w-full h-full flex flex-col">
            {NotificationToast}

            <div className="flex-1 overflow-auto">
                <CharteProjet />
            </div>

            <div className="actions-bar flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
                <Button variant="secondary" onClick={() => setIsCancelConfirmOpen(true)} disabled={isSaving}>
                    Annuler
                </Button>
                <Button variant="primary" onClick={handleSave} loading={isSaving}>
                    Enregistrer
                </Button>
            </div>

            <Modal
                isOpen={isCancelConfirmOpen}
                onClose={() => setIsCancelConfirmOpen(false)}
                title="Annuler les modifications ?"
                size="sm"
            >
                <p className="text-sm text-slate-600">
                    Les modifications non enregistrées de la charte et des livrables seront perdues
                    et remplacées par la dernière version enregistrée.
                </p>
                <ModalFooter>
                    <Button variant="secondary" onClick={() => setIsCancelConfirmOpen(false)}>
                        Retour
                    </Button>
                    <Button variant="danger" onClick={confirmCancel}>
                        Oui, annuler
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}
