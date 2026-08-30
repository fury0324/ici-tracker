import React, { createContext, useCallback, useContext, useState } from 'react';
import { AppModal, AppModalButton, AppModalVariant } from '../components/AppModal';

interface ShowModalOptions {
  variant?: AppModalVariant;
  title: string;
  message?: string;
  buttons?: AppModalButton[];
}

interface ModalStoreContextValue {
  showModal: (options: ShowModalOptions) => void;
}

const ModalStoreContext = createContext<ModalStoreContextValue | undefined>(undefined);

export function ModalStoreProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ShowModalOptions>({ title: '' });

  const showModal = useCallback((next: ShowModalOptions) => {
    setOptions(next);
    setVisible(true);
  }, []);

  const handleDismiss = useCallback(() => setVisible(false), []);

  return (
    <ModalStoreContext.Provider value={{ showModal }}>
      {children}
      <AppModal
        visible={visible}
        variant={options.variant ?? 'info'}
        title={options.title}
        message={options.message}
        buttons={options.buttons ?? [{ text: 'OK' }]}
        onDismiss={handleDismiss}
      />
    </ModalStoreContext.Provider>
  );
}

export function useAppModal(): ModalStoreContextValue {
  const context = useContext(ModalStoreContext);
  if (!context) {
    throw new Error('useAppModal must be used within a ModalStoreProvider');
  }
  return context;
}
