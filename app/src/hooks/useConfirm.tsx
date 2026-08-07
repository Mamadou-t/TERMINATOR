import { useCallback, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { Modal, ModalFooter } from '../components/Modal';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}

const DEFAULT_OPTIONS: Required<Pick<ConfirmOptions, 'title' | 'confirmLabel' | 'cancelLabel' | 'variant'>> = {
  title: 'Confirmer la suppression',
  confirmLabel: 'Supprimer',
  cancelLabel: 'Annuler',
  variant: 'danger'
};

/**
 * Boite de dialogue de confirmation reutilisable, basee sur Modal.
 * Usage : const { confirm, ConfirmDialog } = useConfirm();
 *         if (await confirm({ message: '...' })) { ... }
 *         return <>{ConfirmDialog}...</>
 */
export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const respond = (result: boolean) => {
    setOptions(null);
    resolver.current?.(result);
    resolver.current = null;
  };

  const merged = options ? { ...DEFAULT_OPTIONS, ...options } : null;

  const ConfirmDialog = merged ? (
    <Modal isOpen onClose={() => respond(false)} title={merged.title} size="sm">
      <p className="text-sm text-slate-600">{merged.message}</p>
      <ModalFooter>
        <Button variant="secondary" onClick={() => respond(false)}>
          {merged.cancelLabel}
        </Button>
        <Button variant={merged.variant} onClick={() => respond(true)}>
          {merged.confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  ) : null;

  return { confirm, ConfirmDialog };
}
