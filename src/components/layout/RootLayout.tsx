import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CommandMenu } from '../ui/CommandMenu';
import { AuthModal } from '../auth/AuthModal';
import { ErrorBoundary } from './ErrorBoundary';

export const RootLayout: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="ambient-mesh-bg flex min-h-screen flex-col text-brand-black selection:bg-brand-orange selection:text-white">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <CommandMenu />
        <AuthModal />
      </div>
    </ErrorBoundary>
  );
};
