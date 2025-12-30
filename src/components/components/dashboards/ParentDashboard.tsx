import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/mockApi';
import { Card, CardContent } from '../ui/Card';
import { ParentProfileView } from './parent/ParentProfileView';
import { ParentActivitiesView } from './parent/ParentActivitiesView';
import { DependentsView } from './parent/DependentsView';
import { SchoolManagementView } from './parent/SchoolManagementView';
import { ParentPaymentsView } from './parent/ParentPaymentsView';
import { NotifyPickupModal } from '../forms/NotifyPickupModal';
import { DependentProfileView } from './parent/DependentProfileView';
import { ParentCommunicationView } from './parent/ParentCommunicationView';
import { ParentReportsView } from './parent/ParentReportsView';
import { MarketplaceView } from './parent/MarketplaceView';
import { FundManagementView } from './parent/FundManagementView';
import { ParentOrdersView } from './parent/ParentOrdersView';
import { Button } from '../ui/Button';
import type { MediaPost, User } from '../../types';

// Icons
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const BoxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>;
const ThumbUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>;

// Mock data for "What's for today"
const dailyTasks = [
    { id: 1, title: 'Tarea de Matemáticas', desc: 'Entrega mañana', icon: '📐', color: 'border-l-4 border-electric-blue', bg: 'bg-white' },
    { id: 2, title: 'Clase de Natación', desc: 'Traer toalla', icon: '🏊‍♂️', color: 'border-l-4 border-fresh-mint', bg: 'bg-white' },
    { id: 3, title: 'Feria de Ciencias', desc: 'Confirmar asistencia', icon: '🌋', color: 'border-l-4 border-mango-yellow', bg: 'bg-white' },
    { id: 4, title: 'Pago de Mensualidad', desc: 'Vence en 3 días', icon: '💰', color: 'border-l-4 border-soft-coral', bg: 'bg-white' },
];

const DashboardHome: React.FC<{ 
    onNavigate: (view: string) => void; 
    onNotifyPickup: () => void;
}> = ({ onNavigate, onNotifyPickup }) => {
    const { currentUser } = useAppContext();
    const { t } = useTranslation();
    const [posts, setPosts] = useState<MediaPost[]>([]);
    const [users, setUsers] = useState<Map<string, User>>(new Map());

    useEffect(() => {
        if (currentUser?.schoolId) {
            // Load some posts for the "News Wall"
            const fetchData = async () => {
                const [postsData, usersData] = await Promise.all([
                    api.getMediaPosts(currentUser.schoolId!),
                    api.getUsers()
                ]);
                // Get latest 3 posts
                setPosts(postsData.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 3));
                setUsers(new Map(usersData.map(u => [u.id, u])));
            };
            fetchData();
        }
    }, [currentUser]);

    const familyName = currentUser?.name.split(' ')[1] || 'Familia';

    return (
        <div className="space-y-10">
            {/* Header / Greeting */}
            <div className="animate-fade-in-up">
                <h1 className="text-4xl font-display font-bold text-text-primary">
                    ¡Buenos días, {t('parent.welcome', { name: currentUser?.name.split(' ')[0] })}! ☀️
                </h1>
                <p className="text-lg text-text-secondary mt-2">Hoy es un gran día para aprender.</p>
            </div>

            {/* Carousel: What's for today? */}
            <section className="animate-fade-in-up delay-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-display font-bold text-text-primary">¿Qué hay para hoy?</h2>
                </div>
                <div className="flex space-x-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar">
                    {dailyTasks.map(task => (
                        <div key={task.id} className={`snap-center shrink-0 w-64 p-5 rounded-3xl shadow-soft hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${task.bg} ${task.color}`}>
                            <div className="flex items-center gap-4">
                                <span className="text-4xl">{task.icon}</span>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm">{task.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{task.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: News Feed */}
                <div className="lg:col-span-2 space-y-6 animate-fade-in-up delay-200">
                    <h2 className="text-xl font-display font-bold text-text-primary">Muro de Novedades</h2>
                    {posts.length > 0 ? (
                        posts.map(post => {
                            const author = users.get(post.authorId);
                            return (
                                <div key={post.id} className="bg-white rounded-3xl p-5 shadow-soft border border-transparent hover:border-gray-100 transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img src={author?.avatarUrl} alt={author?.name} className="w-10 h-10 rounded-full object-cover border-2 border-fresh-mint" />
                                        <div>
                                            <p className="font-bold text-sm text-gray-800">{author?.name}</p>
                                            <p className="text-xs text-gray-400">{new Date(post.timestamp).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl overflow-hidden mb-4">
                                        <img src={post.imageUrl} alt={post.caption} className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <p className="text-gray-700 text-sm font-medium mb-4">{post.caption}</p>
                                    <div className="flex gap-3">
                                        <Button size="sm" variant="secondary" className="rounded-full px-4 text-xs flex items-center gap-2 hover:text-red-500 hover:bg-red-50 border-none bg-gray-100">
                                            <HeartIcon /> Me encanta
                                        </Button>
                                        <Button size="sm" variant="secondary" className="rounded-full px-4 text-xs flex items-center gap-2 hover:text-blue-500 hover:bg-blue-50 border-none bg-gray-100">
                                            <ThumbUpIcon /> Entendido
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white rounded-3xl p-8 text-center shadow-soft">
                            <span className="text-4xl">📭</span>
                            <p className="text-gray-500 mt-2 font-medium">No hay novedades recientes.</p>
                        </div>
                    )}
                </div>

                {/* Right Col: Quick Access */}
                <div className="space-y-6 animate-fade-in-up delay-300">
                    <h2 className="text-xl font-display font-bold text-text-primary">Accesos Rápidos</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => onNavigate('messages')} className="bg-lavender/20 hover:bg-lavender/30 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 transition-colors h-32 group">
                            <div className="bg-white p-3 rounded-full text-accent-purple shadow-sm group-hover:scale-110 transition-transform">
                                <PhoneIcon />
                            </div>
                            <span className="text-sm font-bold text-gray-700">Contactar</span>
                        </button>
                        
                        <button onClick={() => onNavigate('schoolManagement')} className="bg-fresh-mint/20 hover:bg-fresh-mint/30 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 transition-colors h-32 group">
                            <div className="bg-white p-3 rounded-full text-accent-green shadow-sm group-hover:scale-110 transition-transform">
                                <ClipboardListIcon />
                            </div>
                            <span className="text-sm font-bold text-gray-700">Gestión</span>
                        </button>

                        <button onClick={() => onNavigate('myOrders')} className="bg-mango-yellow/20 hover:bg-mango-yellow/30 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 transition-colors h-32 group">
                            <div className="bg-white p-3 rounded-full text-accent-yellow shadow-sm group-hover:scale-110 transition-transform">
                                <BoxIcon />
                            </div>
                            <span className="text-sm font-bold text-gray-700">Mis Pedidos</span>
                        </button>

                        <button onClick={() => onNavigate('messages')} className="bg-soft-coral/20 hover:bg-soft-coral/30 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 transition-colors h-32 group">
                            <div className="bg-white p-3 rounded-full text-accent-red shadow-sm group-hover:scale-110 transition-transform">
                                <ChatIcon />
                            </div>
                            <span className="text-sm font-bold text-gray-700">Chat</span>
                        </button>
                    </div>

                    <div className="bg-gradient-to-r from-electric-blue to-lavender rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">¡Hora de Salida! 🚗</h3>
                            <p className="text-white/90 text-sm mb-4">Avisa que vas llegando para agilizar la entrega.</p>
                            <Button className="bg-white text-primary hover:bg-gray-100 w-full rounded-xl font-bold shadow-md border-none" onClick={onNotifyPickup}>
                                Notificar Recogida
                            </Button>
                        </div>
                        <div className="absolute top-0 right-0 opacity-20 transform translate-x-4 -translate-y-4">
                            <svg width="100" height="100" viewBox="0 0 100 100" fill="white">
                                <circle cx="50" cy="50" r="50" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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