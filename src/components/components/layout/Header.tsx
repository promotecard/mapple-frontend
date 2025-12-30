import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { Role } from '../../types';
import { Input } from '../ui/Input';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

export const Header: React.FC<{
    toggleSidebar: () => void;
    onNavigate: (view: string) => void;
    notificationCounts: { [key: string]: number };
}> = ({ toggleSidebar, onNavigate, notificationCounts }) => {
  const { currentUser, logout } = useAppContext();
  const { t } = useTranslation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!currentUser) return null;

  const hasUnreadMessages = (notificationCounts['Mensajes'] || 0) > 0 || (notificationCounts['Chat'] || 0) > 0 || (notificationCounts['Comunicados'] || 0) > 0;

  return (
    <header className="bg-surface shadow-sm sticky top-0 z-30 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="lg:hidden text-gray-500 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden lg:flex items-center">
              <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                  </span>
                  <Input placeholder={t('search')} className="pl-10 w-64 bg-secondary-DEFAULT border-none focus:bg-white focus:ring-primary" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 ml-auto">
             <LanguageSwitcher />
             <button onClick={() => onNavigate(currentUser.role === Role.ProviderAdmin ? 'Chat' : (currentUser.role === Role.Teacher ? 'Comunicados' : 'Mensajes'))} className="relative p-2 rounded-full text-gray-500 hover:bg-secondary-DEFAULT hover:text-gray-700 focus:outline-none" aria-label={t('viewNotifications')}>
              {hasUnreadMessages && (
                <span className="absolute top-1 right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-red"></span>
                </span>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <div className="relative" ref={menuRef}>
              <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center space-x-2 p-1 rounded-full hover:bg-secondary-DEFAULT">
                <img className="h-10 w-10 rounded-full" src={currentUser.avatarUrl} alt={currentUser.name} />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-text-primary">{currentUser.name}</p>
                  <p className="text-xs text-text-secondary">{currentUser.role}</p>
                </div>
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right bg-surface divide-y divide-gray-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="p-2">
                    <div className="px-4 py-2">
                       <p className="text-sm font-semibold text-text-primary">{currentUser.name}</p>
                       <p className="text-sm text-text-secondary truncate">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="p-2">
                    {(currentUser.role === Role.ProviderAdmin || currentUser.role === Role.Teacher || currentUser.role === Role.Parent) && (
                      <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('Mi Perfil'); setIsProfileMenuOpen(false); }} className="block px-4 py-2 text-sm text-text-secondary rounded-md hover:bg-secondary-DEFAULT hover:text-text-primary">{t('myProfile')}</a>
                    )}
                     <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} className="block w-full text-left px-4 py-2 text-sm text-accent-red rounded-md hover:bg-red-50">{t('logout')}</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};