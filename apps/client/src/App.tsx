import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '@/shared/layout/Layout';
import { GardenPage } from '@/pages/garden';
import { AuthProvider } from '@/hooks/useAuth';
import { MainPage } from '@/pages/main';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<MainPage />} />
            <Route path='garden' element={<GardenPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
