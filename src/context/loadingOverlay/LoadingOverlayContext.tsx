// LoadingOverlayContext.tsx
import React, { createContext, useContext } from 'react';
import { useLoadingOverlay } from './useLoadingOverlay';
import { LoadingOverlay } from './LoadingOverLay';

interface LoadingOverlayObject {
  loading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
  // progress: number;
  // updateProgress: (value: number) => void;
  // resetProgress: () => void;
}
// Crear el contexto con un valor por defecto
const LoadingOverlayContext = createContext<LoadingOverlayObject | null>(null);

// Crear el proveedor del contexto
const LoadingOverlayProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const loadingOverlay = useLoadingOverlay();

  return (
    <LoadingOverlayContext.Provider value={loadingOverlay}>
      {children}
      {loadingOverlay.loading && (
        <LoadingOverlay loading={loadingOverlay.loading} />
      )}
    </LoadingOverlayContext.Provider>
  );
};

// Crear un hook personalizado para usar el contexto
export const useLoadingOverlayContext = () => {
  const context = useContext(LoadingOverlayContext);
  if (!context) {
    throw new Error(
      'useLoadingOverlayContext must be used within a LoadingOverlayProvider'
    );
  }
  return context;
};

export default LoadingOverlayProvider;
