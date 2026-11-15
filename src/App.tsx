import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { LanguageProvider } from './locales/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { AuthModal } from './components/auth/AuthModal';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <AuthModal />
      </AuthProvider>
    </LanguageProvider>
  );
};
