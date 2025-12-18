
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardView } from './provider/DashboardView';
import { ProductsView } from './provider/ProductsView';
import { CatalogsView } from './provider/CatalogsView';
import { OrdersView } from './provider/OrdersView';
import { ReportsView } from './provider/ReportsView';
import { POSView } from './provider/POSView';
import { UsersView } from './provider/UsersView';
import { ProfileView } from './provider/ProfileView';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { api } from '../../services/mockApi';
import { useAppContext } from '../../context/AppContext';
import type { Conversation, Message, User, School } from '../../types';


const ChatView: React.FC = () => {
    const { currentUser } = useAppContext();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [users, setUsers] = useState<Map<string, User>>(new Map());
    const [schools, setSchools] = useState<Map<string, School>>(new Map());
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchData = useCallback(async () => {
        if (!currentUser?.providerId) return;

        const [usersData, convosData, linkedSchoolsData] = await Promise.all([
            api.getUsers(),
            api.getConversationsForUser(currentUser.id),
            api.getSchoolsByProvider(currentUser.providerId),
        ]);
        
        setUsers(new Map(usersData.map(u => [u.id, u])));
        setSchools(new Map(linkedSchoolsData.map(s => [s.id, s])));

        const sortedConvos = convosData.sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());
        setConversations(sortedConvos);

        if (sortedConvos.length > 0) {
            handleConversationSelect(sortedConvos[0]);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleConversationSelect = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        api.getMessagesForConversation(conversation.id).then(setMessages);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !currentUser) return;

        const sentMessage = await api.sendMessage(selectedConversation.id, currentUser.id, newMessage.trim());
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        
        setConversations(prev => {
            const updatedConvo = { ...selectedConversation, lastMessage: { text: sentMessage.content, timestamp: sentMessage.timestamp } };
            return [updatedConvo, ...prev.filter(c => c.id !== selectedConversation.id)];
        });
    };

    const getParticipantDetails = (conv: Conversation) => {
        const otherParticipantId = conv.participantIds.find(id => id !== currentUser?.id);
        if (!otherParticipantId) return { name: 'Unknown', schoolName: 'Unknown School' };
        
        const participant = users.get(otherParticipantId);
        if (!participant) return { name: 'Unknown User', schoolName: 'Unknown School' };

        const school = schools.get(participant.schoolId || '');
        return { name: participant.name, schoolName: school?.name || 'School N/A' };
    };
    
    const filteredConversations = conversations.filter(conv => {
        const { name, schoolName } = getParticipantDetails(conv);
        const lowerSearch = searchTerm.toLowerCase();
        return name.toLowerCase().includes(lowerSearch) || schoolName.toLowerCase().includes(lowerSearch);
    });

    return (
        <Card className="flex h-[calc(100vh-200px)] overflow-hidden">
            {/* Conversation List */}
            <div className="w-1/3 border-r flex flex-col">
                <div className="p-4 border-b">
                    <Input placeholder="Buscar por admin o colegio..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <ul className="overflow-y-auto">
                    {filteredConversations.map(conv => {
                        const { name, schoolName } = getParticipantDetails(conv);
                        return (
                            <li key={conv.id} onClick={() => handleConversationSelect(conv)} className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${selectedConversation?.id === conv.id ? 'bg-primary-light' : ''}`}>
                                <img src={conv.avatarUrl} alt={name} className="w-12 h-12 rounded-full" />
                                <div className="ml-3 flex-grow overflow-hidden">
                                    <p className="font-semibold truncate">{name}</p>
                                    <p className="text-xs text-text-secondary truncate">{schoolName}</p>
                                    <p className="text-sm text-text-secondary truncate">{conv.lastMessage.text}</p>
                                </div>
                                {conv.unreadCount > 0 && <Badge color="blue">{conv.unreadCount}</Badge>}
                            </li>
                        );
                    })}
                </ul>
            </div>
            
            {/* Message Area */}
            <div className="w-2/3 flex flex-col bg-surface">
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b flex items-center bg-gray-50/70">
                            <img src={selectedConversation.avatarUrl} alt={selectedConversation.name} className="w-10 h-10 rounded-full" />
                            <div className="ml-3">
                                <h3 className="text-lg font-semibold">{getParticipantDetails(selectedConversation).name}</h3>
                                <p className="text-xs text-text-secondary">{getParticipantDetails(selectedConversation).schoolName}</p>
                            </div>
                        </div>
                        <div className="flex-grow p-4 overflow-y-auto bg-background">
                            {messages.map(msg => {
                                const sender = users.get(msg.senderId);
                                const isMe = msg.senderId === currentUser?.id;
                                return (
                                    <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
                                        {!isMe && sender && <img src={sender.avatarUrl} className="w-6 h-6 rounded-full" />}
                                        <div className={`max-w-md p-3 rounded-2xl ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-surface text-text-primary rounded-bl-none shadow-sm'}`}>
                                            <p>{msg.content}</p>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t bg-surface">
                             <div className="flex items-center space-x-2">
                                <Input 
                                    placeholder="Escribe un mensaje..." 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                                    className="bg-secondary-DEFAULT border-none focus:bg-white"
                                />
                                <Button onClick={handleSendMessage}>Enviar</Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-text-secondary">
                        <p>Selecciona una conversación para empezar a chatear.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};


export const ProviderAdminDashboard: React.FC<{ activeView?: string }> = ({ activeView = 'dashboard' }) => {
  const { t } = useTranslation();
  const renderContent = () => {
    switch (activeView) {
      case 'products': return <ProductsView />;
      case 'catalogs': return <CatalogsView />;
      case 'orders': return <OrdersView />;
      case 'pos': return <POSView />;
      case 'reports': return <ReportsView />;
      case 'users': return <UsersView />;
      case 'chat': return <ChatView />;
      case 'myProfile': return <ProfileView />;
      case 'dashboard':
      default: return <DashboardView />;
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-display font-bold text-text-primary">{t(`sidebar.${activeView}`)}</h1>
      {renderContent()}
    </div>
  );
};
