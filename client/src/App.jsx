import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';

// Route-level code splitting for Admin Dashboard
const AdminPage = lazy(() => import('./pages/AdminPage'));

const PageLoader = () => (
  <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-[#B600A8] border-t-transparent animate-spin" />
  </div>
);

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
