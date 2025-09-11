import { useCallback, useState } from 'react';

export function useLoadingOverlay() {
  const [loading, setLoading] = useState(false);
  // const [progress, setProgress] = useState(0);

  const showLoading = useCallback(() => setLoading(true), []);

  const hideLoading = useCallback(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // const updateProgress = (value: number) => {
  //   const newProgress = Math.min(100, progress + value); // Ensure progress doesn't exceed 100%
  //   setProgress(newProgress);

  //   // Calculate the new progress value by adding to the current progress
  // };

  // const resetProgress = () => {
  //   setTimeout(() => {
  //     setProgress(0);
  //   }, 2000);
  // };

  return {
    loading,
    showLoading,
    hideLoading,
    // progress,
    // updateProgress,
    // resetProgress,
  };
}
