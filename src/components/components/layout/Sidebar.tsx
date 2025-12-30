import React from 'react';
import { useTranslation } from 'react-i18next';
import { Role, ProviderPermission, Permission } from '../../types';
import { useAppContext } from '../../context/AppContext';

// Icons (Standard)
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const SchoolIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const ProviderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const SubscriptionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AcademicCapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3" /></svg>;
const UsersGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-9 3a2 2 0 11-4 0 2 2 0 014 0zM19 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const CatalogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const PaymentsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const LibraryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>;
const LightBulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0m-7.072 0a5 5 0 010-7.072" /></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
const DocumentTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ShoppingCartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const BoxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const DesktopComputerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const PresentationChartLineIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

interface SidebarProps {
  role: Role;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeView: string;
  onNavigate: (view: string) => void;
  notificationCounts: { [key: string]: number };
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, setIsOpen, activeView, onNavigate, notificationCounts }) => {
  const { permissions, landingPageConfig } = useAppContext();
  const { t } = useTranslation();
  
  const handleNavigate = (view: string) => {
    onNavigate(view);
    if (window.innerWidth < 1024) { // Close on mobile
        setIsOpen(false);
    }
  };

  // Determine styling based on role (Playful Modern for Parents)
  const isParent = role === Role.Parent;
  
  // Custom Color Logic for Parents (Playful Modern)
  const parentNavStyles = {
      container: 'bg-surface border-r border-gray-100 shadow-soft',
      textNormal: 'text-gray-500 font-medium font-display',
      textActive: 'text-primary font-bold bg-primary-light/50',
      iconNormal: 'text-gray-400',
      iconActive: 'text-primary',
      headerText: 'text-primary font-bold'
  };

  // Legacy Logic for other roles (Darker/Formal)
  const adminNavStyles = {
      container: role === Role.GlobalAdmin ? 'bg-slate-800 text-gray-300' : 'bg-blue-700 text-white',
      textNormal: 'font-normal hover:bg-white/10 hover:text-white',
      textActive: 'bg-white/20 text-white font-semibold',
      iconNormal: 'opacity-70',
      iconActive: 'opacity-100',
      headerText: 'text-white'
  };

  const styles = isParent ? parentNavStyles : adminNavStyles;

  const NavItem: React.FC<{ name: string; icon: React.ReactNode; permission?: ProviderPermission | Permission; color?: string }> = ({ name, icon, permission, color }) => {
    if (permission && !permissions.includes(permission)) return null;

    const isActive = activeView === name;
    const hasNotification = (notificationCounts[name] || 0) > 0;
    
    // Playful Icon Coloring for Parents
    const iconClass = isParent ? (isActive ? color || styles.iconActive : 'text-gray-400 group-hover:text-gray-600') : (isActive ? styles.iconActive : styles.iconNormal);

    return (
      <li className="mb-2">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); handleNavigate(name); }}
          className={`flex items-center p-3 rounded-2xl transition-all duration-200 group ${
            isActive ? styles.textActive : styles.textNormal
          } ${isParent && !isActive ? 'hover:bg-gray-50 hover:pl-4' : ''}`}
        >
          <span className={`${iconClass} transition-colors duration-200`}>{icon}</span>
          <span className="ml-3 flex-1 whitespace-nowrap">{t(`sidebar.${name}`)}</span>
          {hasNotification && (
            <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${isActive ? 'bg-white text-primary' : 'bg-accent-red text-white'}`}>{notificationCounts[name]}</span>
          )}
        </a>
      </li>
    );
  };

  const globalAdminNavItems = [
    { name: 'dashboard', icon: <DashboardIcon /> },
    { name: 'schools', icon: <SchoolIcon /> },
    { name: 'providers', icon: <ProviderIcon /> },
    { name: 'users', icon: <UsersIcon /> },
    { name: 'linkages', icon: <LinkIcon /> },
    { name: 'subscriptions', icon: <SubscriptionIcon /> },
    { name: 'homePage', icon: <PresentationChartLineIcon /> },
    { name: 'settings', icon: <SettingsIcon /> },
  ];
  
  const schoolAdminNavItems = [
    { name: 'dashboard', icon: <DashboardIcon /> },
    { name: 'activities', icon: <ActivityIcon /> },
    { name: 'gradesAndClasses', icon: <AcademicCapIcon /> },
    { name: 'staff', icon: <UsersIcon /> },
    { name: 'parentsAndStudents', icon: <UsersGroupIcon /> },
    { name: 'library', icon: <LibraryIcon /> },
    { name: 'lms', icon: <AcademicCapIcon /> },
    { name: 'virtualTutor', icon: <LightBulbIcon /> },
    { name: 'programs', icon: <CatalogIcon /> },
    { name: 'externalEnrollments', icon: <ClipboardListIcon /> },
    { name: 'communication', icon: <ChatIcon /> },
    { name: 'payments', icon: <PaymentsIcon /> },
    { name: 'providers', icon: <ProviderIcon /> },
  ];

  const teacherNavItems = [
    { name: 'dashboard', icon: <DashboardIcon /> },
    { name: 'myCourses', icon: <AcademicCapIcon /> },
    { name: 'attendance', icon: <ClipboardListIcon />, permission: Permission.ManageAttendance },
    { name: 'pickup', icon: <UsersIcon />, permission: Permission.ViewPickupInfo },
    { name: 'communications', icon: <ChatIcon />, permission: Permission.SendCommunications },
    { name: 'myConsumption', icon: <CreditCardIcon /> },
    { name: 'myProfile', icon: <UserCircleIcon /> },
  ];

  // Updated Parent Nav Items with Playful Colors
  const parentNavItems = [
    { name: 'home', icon: <HomeIcon />, color: 'text-primary' },
    { name: 'marketplace', icon: <ShoppingCartIcon />, color: 'text-accent-purple' },
    { name: 'myOrders', icon: <BoxIcon />, color: 'text-accent-yellow' },
    { name: 'activities', icon: <ActivityIcon />, color: 'text-accent-yellow' },
    { name: 'dependents', icon: <UsersGroupIcon />, color: 'text-accent-green' },
    { name: 'schoolManagement', icon: <DocumentTextIcon />, color: 'text-primary' },
    { name: 'messages', icon: <ChatIcon />, color: 'text-accent-red' }, // "Moments" / Communications can share this view
    { name: 'myProfile', icon: <UserCircleIcon />, color: 'text-gray-600' },
  ];

  const providerAdminNavItems = [
    { name: 'dashboard', icon: <DashboardIcon />, permission: ProviderPermission.ViewDashboard },
    { name: 'products', icon: <CatalogIcon />, permission: ProviderPermission.ManageProducts },
    { name: 'catalogs', icon: <CatalogIcon />, permission: ProviderPermission.ManageCatalogs },
    { name: 'orders', icon: <ClipboardListIcon />, permission: ProviderPermission.ViewOrders },
    { name: 'pos', icon: <DesktopComputerIcon />, permission: ProviderPermission.UsePOS },
    { name: 'reports', icon: <ChartBarIcon />, permission: ProviderPermission.ViewReports },
    { name: 'users', icon: <UsersGroupIcon />, permission: ProviderPermission.ManageUsers },
    { name: 'chat', icon: <ChatIcon /> },
    { name: 'myProfile', icon: <UserCircleIcon /> },
  ];
  
  const studentNavItems = [
      { name: 'home', icon: <HomeIcon /> },
      { name: 'library', icon: <LibraryIcon /> },
      { name: 'myCourses', icon: <AcademicCapIcon /> },
      { name: 'virtualTutor', icon: <LightBulbIcon /> },
      { name: 'settings', icon: <SettingsIcon /> },
  ];

  let navItems: any[] = [];
  switch (role) {
    case Role.GlobalAdmin: navItems = globalAdminNavItems; break;
    case Role.SchoolAdmin: navItems = schoolAdminNavItems; break;
    case Role.Teacher: navItems = teacherNavItems; break;
    case Role.Parent: navItems = parentNavItems; break;
    case Role.ProviderAdmin: navItems = providerAdminNavItems; break;
    case Role.Student: navItems = studentNavItems; break;
  }
  
  if (role === Role.ProviderAdmin && permissions.length === 1 && permissions[0] === ProviderPermission.UsePOS) {
      navItems = navItems.filter(item => item.name === 'pos' || item.name === 'myProfile');
  }

  return (
    <>
      <aside className={`fixed top-0 left-0 z-40 w-72 h-screen transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${styles.container} lg:translate-x-0`}>
        <div className="h-full px-6 py-6 overflow-y-auto flex flex-col">
          <div className={`flex items-center pl-2 mb-8 ${!isParent && 'border-b border-white/20 pb-4'}`}>
            <img src={landingPageConfig?.logoHeaderUrl} alt="Mapple School" className="h-10 w-auto mr-3 bg-white/90 rounded-xl p-1 shadow-sm"/>
            <span className={`self-center text-xl font-display font-bold whitespace-nowrap ${styles.headerText}`}>Mapple School</span>
          </div>
          
          <ul className="space-y-2 flex-grow">
            {navItems.map((item) => <NavItem key={item.name} {...item} />)}
          </ul>

          {/* Profile Section for Parents (Bottom) */}
          {isParent && (
             <div className="mt-auto pt-6 border-t border-gray-100">
                 <div className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => handleNavigate('myProfile')}>
                     <div className="relative">
                        <img src={`https://ui-avatars.com/api/?name=User&background=random`} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" alt="Profile" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-fresh-mint rounded-full border-2 border-white"></div>
                     </div>
                     <div>
                         <p className="text-sm font-bold text-text-primary">Mi Cuenta</p>
                         <p className="text-xs text-green-500 font-medium">En línea</p>
                     </div>
                 </div>
             </div>
          )}
        </div>
      </aside>
      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"></div>}
    </>
  );
};