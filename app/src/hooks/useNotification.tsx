import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from '../components/Alert';

export interface Notification {
  id: number;
  variant: 'success' | 'error';
  message: string;
}

const AUTO_DISMISS_MS = 3000;

/**
 * Notification ephemere (succes/erreur) affichee en toast flottant (haut
 * droite) qui disparait automatiquement apres quelques secondes.
 * Usage : const { notifySuccess, notifyError, NotificationToast } = useNotification();
 *         return <>{NotificationToast}...</>
 */
export function useNotification() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const nextId = useRef(0);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [notification]);

  const notifySuccess = useCallback((message: string) => {
    nextId.current += 1;
    setNotification({ id: nextId.current, variant: 'success', message });
  }, []);
  const notifyError = useCallback((message: string) => {
    nextId.current += 1;
    setNotification({ id: nextId.current, variant: 'error', message });
  }, []);
  const clearNotification = useCallback(() => setNotification(null), []);

  const NotificationToast = notification ? (
    <div
      key={notification.id}
      className="fixed top-4 right-4 z-[100] w-full max-w-sm animate-toast-in"
    >
      <Alert
        variant={notification.variant}
        message={notification.message}
        dismissible
        onDismiss={clearNotification}
        className="shadow-lg"
      />
    </div>
  ) : null;

  return { notification, notifySuccess, notifyError, clearNotification, NotificationToast };
}
