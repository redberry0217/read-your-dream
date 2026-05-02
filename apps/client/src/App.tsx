import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { MainPage } from '@/pages/main/MainPage';
import { GardenPage } from '@/pages/garden/GardenPage';
import { AuthProvider } from '@/hooks/useAuth';

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
