import { AuthRoutes } from '@/auth/routes/AuthRoutes';
import { CheckingAuth } from '@/ui';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useCheckAuth } from '@/hooks';
import { IndexRoutes } from '@/auth';

export const AppRouter = () => {
  const status = useCheckAuth();

  if (status === 'checking') {
    return <CheckingAuth />;
  }
  return (
    <Routes>
      {status === 'authenticated' ? (
        <Route path="/*" element={<IndexRoutes />} />
      ) : (
        <Route path="/auth/*" element={<AuthRoutes />} />
      )}
      <Route path="/*" element={<Navigate to="/auth/login/" />} />
    </Routes>
  );
};
