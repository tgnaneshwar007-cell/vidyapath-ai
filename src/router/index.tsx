import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { LandingPage } from '@/pages/LandingPage';
import { ScholarshipsPage } from '@/pages/ScholarshipsPage';
import { ScholarshipDetailPage } from '@/pages/ScholarshipDetailPage';
import { EligibilityPage } from '@/pages/EligibilityPage';
import { AssistantPage } from '@/pages/AssistantPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ApplicationsPage } from '@/pages/ApplicationsPage';
import { SavedScholarshipsPage } from '@/pages/SavedScholarshipsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { AboutPage } from '@/pages/AboutPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';
import { ContactPage } from '@/pages/ContactPage';
import { AdminPage } from '@/pages/AdminPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'scholarships',
        element: <ScholarshipsPage />,
      },
      {
        path: 'scholarships/:slug',
        element: <ScholarshipDetailPage />,
      },
      {
        path: 'eligibility',
        element: <EligibilityPage />,
      },
      {
        path: 'assistant',
        element: <AssistantPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'applications',
        element: <ApplicationsPage />,
      },
      {
        path: 'saved-scholarships',
        element: <SavedScholarshipsPage />,
      },
      {
        path: 'saved',
        element: <Navigate to="/saved-scholarships" replace />,
      },
      {
        path: 'documents',
        element: <DocumentsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'settings',
        element: <Navigate to="/profile" replace />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'privacy',
        element: <PrivacyPage />,
      },
      {
        path: 'terms',
        element: <TermsPage />,
      },
      {
        path: 'contact',
        element: <ContactPage />,
      },
      {
        path: 'admin',
        element: <AdminPage />,
      },
      {
        path: 'admin/*',
        element: <AdminPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
