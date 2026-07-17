import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '@/shared/layout/Layout';
import { GardenPage } from '@/pages/garden';
import { AuthProvider } from '@/hooks/auth/use-auth';
import { MainPage } from '@/pages/main';
import { LoginPage } from './pages/auth/login.page';
import { AuthCallbackPage } from './pages/auth/auth-callback.page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ResultPage } from './pages/result/page';

export default function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/auth/callback' element={<AuthCallbackPage />} />
            <Route element={<Layout />}>
              <Route index element={<MainPage />} />
              <Route path='garden' element={<GardenPage />} />
              <Route path='result' element={<ResultPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
