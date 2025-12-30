
import React, { useState, useEffect } from 'react';
import { Role, ProviderPermission } from '../../types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppContext } from '../../context/AppContext';

interface DashboardLayoutProps {
  role: Role;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState<{ [key: string]: number }>({});
  const { permissions, currentUser } = useAppContext();
  
  const getInitialView = (role: Role) => {
      // Check for specific POS user or permissions
      if (role === Role.ProviderAdmin) {
          // Use the permission check or specific email check for the POS demo user
          if ((permissions.length === 1 && permissions[0] === ProviderPermission.UsePOS) || currentUser?.email === 'pos.demo@demo.com') {
              return 'pos';
          }
          return 'dashboard';
      }
      
      switch(role) {
          case Role.Parent:
          case Role.Student:
              return 'home';
          default:
              return 'dashboard';
      }
  }
  
  // Initialize with function to ensure it runs with latest props/context
  const [activeView, setActiveView] = useState(() => getInitialView(role));

  // When permissions or user changes (login), re-evaluate the initial view.
  useEffect(() => {
      setActiveView(getInitialView(role));
  }, [permissions, role, currentUser]);

  const content = React.isValidElement(children) 
    ? React.cloneElement(children as React.ReactElement<any>, { activeView, setActiveView, setNotificationCounts }) 
    : children;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        role={role} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activeView={activeView}
        onNavigate={setActiveView}
        notificationCounts={notificationCounts}
      />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-72">
        <Header 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNavigate={setActiveView}
          notificationCounts={notificationCounts}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {content}
          </div>
        </main>
      </div>
    </div>
  );
};
