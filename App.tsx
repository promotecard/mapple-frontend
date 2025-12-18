import React, { Suspense } from 'react';
import { useAppContext } from './context/AppContext';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { GlobalAdminDashboard } from './components/dashboards/GlobalAdminDashboard';
import { SchoolAdminDashboard } from './components/dashboards/SchoolAdminDashboard';
import { ParentDashboard } from './components/dashboards/ParentDashboard';
import { TeacherDashboard } from './components/dashboards/TeacherDashboard';
import { ProviderAdminDashboard } from './components/dashboards/ProviderAdminDashboard';
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { Role } from './types';
import 'react-i18next';

const App: React.FC = () => {
  const { currentUser } = useAppContext();

  const dashboard = () => {
    if (!currentUser) {
      return <LandingPage />;
    }

    const renderDashboard = () => {
      switch (currentUser.role) {
        case Role.GlobalAdmin:
          return <GlobalAdminDashboard />;
        case Role.SchoolAdmin:
          return <SchoolAdminDashboard />;
        case Role.Parent:
          return <ParentDashboard />;
        case Role.Teacher:
          return <TeacherDashboard />;
        case Role.ProviderAdmin:
          return <ProviderAdminDashboard />;
        case Role.Student:
          return <StudentDashboard />;
        default:
          return <div>Dashboard for {currentUser.role} is not available yet.</div>;
      }
    };

    return (
      // The key={currentUser.id} ensures that when the user changes (impersonation), 
      // the entire layout is re-mounted, resetting state like active views and sidebar selections.
      <DashboardLayout role={currentUser.role} key={currentUser.id}>
        {renderDashboard()}
      </DashboardLayout>
    );
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {dashboard()}
    </Suspense>
  );
};

export default App;