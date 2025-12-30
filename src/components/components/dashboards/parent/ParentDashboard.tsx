
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { api } from '../../../services/mockApi';
import { Card, CardContent } from '../../ui/Card';
import { ParentProfileView } from './ParentProfileView';
import { ParentActivitiesView } from './ParentActivitiesView';
import { DependentsView } from './DependentsView';
import { SchoolManagementView } from './SchoolManagementView';
import { ParentPaymentsView } from './ParentPaymentsView';
import { NotifyPickupModal } from '../../forms/NotifyPickupModal';
import { DependentProfileView } from './DependentProfileView';
import { ParentCommunicationView } from './ParentCommunicationView';
import { ParentReportsView } from './ParentReportsView';
import { MarketplaceView } from './MarketplaceView';
import { FundManagementView } from './FundManagementView';
import { ParentOrdersView } from './ParentOrdersView';
import { Button } from '../../ui/Button';

const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;
const DependentsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>;
const SchoolMgmtIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const CarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const MarketplaceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>;


const DashboardHome: React.FC<{ 
    onNavigate: (view: string) => void; 
    onNotifyPickup: () => void;
}> = ({ onNavigate, onNotifyPickup }) => {
    const { currentUser } = useAppContext();
    const menuItems = [
        { label: 'Marketplace', description: 'Compra uniformes y otros artículos escolares.', icon: <MarketplaceIcon />, action: () => onNavigate('marketplace'), color: 'text-accent-purple' },
        { label: 'Actividades', description: 'Inscribe, paga y ve los detalles de las actividades.', icon: <ActivityIcon />, action: () => onNavigate('activities'), color: 'text-accent-yellow' },
        { label: 'Dependientes', description: 'Gestiona los perfiles e información de tus hijos.', icon: <DependentsIcon />, action: () => onNavigate('dependents'), color: 'text-accent-green' },
        { label: 'Gestión Escolar', description: 'Pagos, solicitudes, reportes y más.', icon: <SchoolMgmtIcon />, action: () => onNavigate('schoolManagement'), color: 'text-primary' },
    ];

    return (
        <>
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <h1 className="text-4xl font-display font-bold text-text-primary">Hola, {currentUser?.name.split(' ')[0]}</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {menuItems.map(item => (
                    <Card key={item.label} className="hover:shadow-lg hover:border-primary transition-all duration-300 cursor-pointer" onClick={item.action}>
                        <CardContent className="flex items-start space-x-6 p-6">
                            <div className={`p-3 bg-primary-light rounded-lg mt-1 ${item.color}`}>
                                {item.icon}
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-text-primary">{item.label}</h2>
                                <p className="text-text-secondary mt-1 text-sm">{item.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="mt-6">
                <Card className="bg-gradient-to-r from-azul-claro to-morado-creativo text-white">
                     <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold font-display">¿Listo para recoger a tus hijos?</h2>
                            <p className="opacity-90 mt-1">Notifica al colegio que vas en camino para agilizar la entrega.</p>
                        </div>
                        <Button size="lg" className="bg-white text-primary hover:bg-gray-100 flex-shrink-0" onClick={onNotifyPickup}>
                            <CarIcon/> <span className="ml-2">Notificar Recogida</span>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export const ParentDashboard: React.FC<{ 
    activeView?: string; 
    setActiveView?: (view: string) => void; 
    setNotificationCounts?: React.Dispatch<React.SetStateAction<{ [key: string]: number }>> 
}> = ({ activeView = 'home', setActiveView, setNotificationCounts }) => {
  const { currentUser } = useAppContext();
  const [currentView, setCurrentView] = useState(activeView);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser && setNotificationCounts) {
      api.getConversationsForUser(currentUser.id)
        .then(convos => {
          const unreadCount = convos.reduce((acc, c) => acc + c.unreadCount, 0);
          // Map to Sidebar Key 'messages'
          setNotificationCounts(prev => ({ ...prev, 'messages': unreadCount }));
        })
        .catch(console.error);
    }
  }, [currentUser, setNotificationCounts]);

  const navigate = (view: string) => {
    if (setActiveView) {
      setActiveView(view);
    } else {
      setCurrentView(view);
    }
  };

  useEffect(() => {
    // Reset view when sidebar prop changes
    setCurrentView(activeView);
    setSelectedStudentId(null);
  }, [activeView]);

  const handleViewDependentProfile = (studentId: string) => {
      setSelectedStudentId(studentId);
      setCurrentView('dependentProfile');
  };
  
  const handleNavigateToSubView = (view: string) => {
      setCurrentView(view);
  }

  const renderContent = () => {
    if (currentView === 'dependentProfile' && selectedStudentId) {
        const goBackToDependents = () => {
            setSelectedStudentId(null);
            setCurrentView('dependents');
        };
        return <DependentProfileView studentId={selectedStudentId} onBack={goBackToDependents} />;
    }

    switch (currentView) {
      case 'myProfile':
        return <ParentProfileView />;
      case 'marketplace':
        return <MarketplaceView />;
      case 'myOrders':
        return <ParentOrdersView />;
      case 'activities':
        return <ParentActivitiesView onNavigate={handleNavigateToSubView} onBackToHome={() => navigate('home')} />;
      case 'dependents':
        return <DependentsView onViewProfile={handleViewDependentProfile} onBackToHome={() => navigate('home')} />;
      case 'schoolManagement':
        return <SchoolManagementView onNavigate={handleNavigateToSubView} onBackToHome={() => navigate('home')} />;
       case 'payments':
        return <ParentPaymentsView onBack={() => setCurrentView('schoolManagement')} />;
      case 'addFunds':
        return <FundManagementView onBack={() => setCurrentView('schoolManagement')} />;
      case 'reports':
        return <ParentReportsView onBack={() => setCurrentView('schoolManagement')} />;
      case 'messages':
        return <ParentCommunicationView onNavigate={navigate} />;
      case 'home':
      default:
        return <DashboardHome onNavigate={navigate} onNotifyPickup={() => setIsPickupModalOpen(true)} />;
    }
  };

  return (
    <div className="space-y-4">
      {renderContent()}
      {isPickupModalOpen && <NotifyPickupModal isOpen={isPickupModalOpen} onClose={() => setIsPickupModalOpen(false)} />}
    </div>
  );
};
