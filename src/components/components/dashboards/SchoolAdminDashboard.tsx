
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivitiesView } from './school/ActivitiesView';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { GradesAndClassesView } from './school/GradesAndClassesView';
import { StaffView } from './school/StaffView';
import { ParentsAndStudentsView } from './school/ParentsAndStudentsView';
import { StudentEnrollmentFormView } from './school/StudentEnrollmentFormView';
import { CatalogsView } from './school/CatalogsView';
import { ExternalEnrollmentsView } from './school/ExternalEnrollmentsView';
import { CommunicationView } from './school/CommunicationView';
import { PaymentsView } from './school/PaymentsView';
import { LibraryAdminView } from './school/LibraryAdminView';
import { LMSAdminView } from './school/LMSAdminView';
import { TutorAdminView } from './school/TutorAdminView';
import { ProvidersView } from './school/ProvidersView';

const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const UsersGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-9 3a2 2 0 11-4 0 2 2 0 014 0zM19 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const PaymentsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;

interface DashboardHomeViewProps {
    onNavigate: (view: string) => void;
}

const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({ onNavigate }) => {
    const { t } = useTranslation();

    const shortcuts = [
        { id: 'activities', title: 'Actividades', desc: 'Gestionar eventos y clases', icon: <ActivityIcon />, color: 'bg-blue-100 text-blue-600' },
        { id: 'parentsAndStudents', title: 'Padres y Estudiantes', desc: 'Directorio y perfiles', icon: <UsersGroupIcon />, color: 'bg-green-100 text-green-600' },
        { id: 'communication', title: 'Comunicación', desc: 'Mensajes y circulares', icon: <ChatIcon />, color: 'bg-yellow-100 text-yellow-600' },
        { id: 'payments', title: 'Pagos', desc: 'Transacciones y reportes', icon: <PaymentsIcon />, color: 'bg-purple-100 text-purple-600' },
    ];

    return (
        <div className="space-y-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none shadow-md">
                <CardContent className="p-8">
                    <h2 className="text-3xl font-bold mb-2">{t('welcome')}</h2>
                    <p className="text-blue-100 text-lg opacity-90">{t('globalAdmin.welcomeSub')}</p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {shortcuts.map((item) => (
                    <Card 
                        key={item.id} 
                        className="hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 hover:-translate-y-1" 
                        style={{ borderLeftColor: 'currentColor' }}
                        onClick={() => onNavigate(item.id)}
                    >
                        <CardContent className="flex items-center p-6">
                            <div className={`p-4 rounded-2xl mr-4 ${item.color}`}>
                                {item.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};


export const SchoolAdminDashboard: React.FC<{ activeView?: string }> = ({ activeView = 'dashboard' }) => {
    const { t } = useTranslation();
    const [currentView, setCurrentView] = useState(activeView);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const navigateToStudentForm = (studentId: string) => {
        setSelectedStudentId(studentId);
        setCurrentView('StudentForm');
    };
    
    const navigateBackToList = () => {
        setSelectedStudentId(null);
        setCurrentView('parentsAndStudents');
    };

    React.useEffect(() => {
        if (activeView !== 'StudentForm') {
            setCurrentView(activeView);
            setSelectedStudentId(null);
        }
    }, [activeView]);


  const renderContent = () => {
    if (currentView === 'StudentForm' && selectedStudentId) {
        return <StudentEnrollmentFormView studentId={selectedStudentId} onBack={navigateBackToList} />;
    }

    switch (currentView) {
      case 'activities':
        return <ActivitiesView />;
      case 'gradesAndClasses':
        return <GradesAndClassesView />;
      case 'staff':
        return <StaffView />;
      case 'parentsAndStudents':
        return <ParentsAndStudentsView onNavigateToStudentForm={navigateToStudentForm} />;
      case 'library':
        return <LibraryAdminView />;
      case 'lms':
        return <LMSAdminView />;
      case 'virtualTutor':
        return <TutorAdminView />;
      case 'programs':
        return <CatalogsView />;
      case 'externalEnrollments':
        return <ExternalEnrollmentsView />;
      case 'communication':
        return <CommunicationView />;
      case 'payments':
        return <PaymentsView />;
      case 'providers':
        return <ProvidersView />;
      case 'dashboard':
      default:
        return <DashboardHomeView onNavigate={setCurrentView} />;
    }
  };

  const getTitle = () => {
      if (currentView === 'StudentForm') return 'Formulario de Inscripción del Estudiante';
      return t(`sidebar.${currentView}`);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-display font-bold text-text-primary">
        {getTitle()}
      </h1>
      {renderContent()}
    </div>
  );
};
