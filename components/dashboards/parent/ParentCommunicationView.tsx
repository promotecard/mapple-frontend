
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import type { Conversation, Message, MediaPost, Activity, User, Comment, Student } from '../../../types';
import { Role } from '../../../types';
import { CreateGroupChatModal } from '../../forms/CreateGroupChatModal';
import { ActivityDetailsModal } from '../../forms/ActivityDetailsModal';

// --- Icons ---
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const HeartIcon = ({ filled }: { filled: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${filled ? 'text-red-500' : 'text-gray-500'}`} fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>;
const ChatBubbleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>;
const FolderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

// --- Sub-Components ---

interface ChatListProps {
    conversations: Conversation[];
    selected: Conversation | null;
    onSelect: (c: Conversation) => void;
    parents: User[];
    teachers: User[];
    currentUser: User | null;
    onCreateChat: (targetUserId: string, targetName: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ conversations, selected, onSelect, parents, teachers, currentUser, onCreateChat }) => {
    const [activeTab, setActiveTab] = useState<'chats' | 'contacts'>('chats');
    const [searchTerm, setSearchTerm] = useState('');

    // --- Filtered Lists ---
    
    const filteredConversations = conversations.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastMessage.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredGroups = conversations.filter(c => c.isGroup && c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const filteredTeachers = teachers.filter(t => 
        t.id !== currentUser?.id && 
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredParents = parents.filter(p => 
        p.id !== currentUser?.id && 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleContactClick = (user: User) => {
        // Check if conversation exists
        const existing = conversations.find(c => 
            !c.isGroup && c.participantIds.includes(user.id) && c.participantIds.includes(currentUser?.id || '')
        );

        if (existing) {
            onSelect(existing);
        } else {
            onCreateChat(user.id, user.name);
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <div className="p-4 border-b space-y-3">
                <div className="flex rounded-lg bg-gray-100 p-1">
                    <button 
                        onClick={() => setActiveTab('chats')} 
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'chats' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Chats
                    </button>
                    <button 
                        onClick={() => setActiveTab('contacts')} 
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'contacts' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Contactos
                    </button>
                </div>
                <div className="relative">
                    <Input 
                        placeholder="Buscar..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="pl-9 bg-gray-50 border-transparent focus:bg-white"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                </div>
            </div>

            <CardContent className="p-0 overflow-y-auto flex-grow">
                {activeTab === 'chats' ? (
                    <ul>
                        {filteredConversations.length > 0 ? filteredConversations.map(conv => (
                            <li key={conv.id} onClick={() => onSelect(conv)} className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${selected?.id === conv.id ? 'bg-blue-50 border-blue-500' : 'border-transparent'}`}>
                                <div className="relative">
                                    <img src={conv.avatarUrl} alt={conv.name} className="w-10 h-10 rounded-full object-cover" />
                                    {conv.isGroup && <span className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow"><UserGroupIcon /></span>}
                                </div>
                                <div className="ml-3 flex-grow overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold truncate text-sm text-gray-800">{conv.name || `Chat`}</p>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                            {new Date(conv.lastMessage.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage.text}</p>
                                </div>
                                {conv.unreadCount > 0 && <Badge color="blue" className="ml-2">{conv.unreadCount}</Badge>}
                            </li>
                        )) : <div className="p-4 text-center text-gray-500 text-sm">No hay conversaciones recientes.</div>}
                    </ul>
                ) : (
                    <div className="space-y-1">
                        {/* Groups Section */}
                        {filteredGroups.length > 0 && (
                            <div>
                                <div className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">Mis Grupos</div>
                                <ul>
                                    {filteredGroups.map(group => (
                                        <li key={group.id} onClick={() => onSelect(group)} className="flex items-center p-3 cursor-pointer hover:bg-gray-50">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                {group.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <p className="ml-3 text-sm font-medium text-gray-700">{group.name}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Teachers Section - Assuming simulated config allows this */}
                        {filteredTeachers.length > 0 && (
                            <div>
                                <div className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">Profesores</div>
                                <ul>
                                    {filteredTeachers.map(teacher => (
                                        <li key={teacher.id} onClick={() => handleContactClick(teacher)} className="flex items-center p-3 cursor-pointer hover:bg-gray-50">
                                            <img src={teacher.avatarUrl} className="w-8 h-8 rounded-full object-cover" alt={teacher.name} />
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-700">{teacher.name}</p>
                                                <p className="text-xs text-gray-400">Docente</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Parents Section */}
                        {filteredParents.length > 0 && (
                            <div>
                                <div className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">Padres</div>
                                <ul>
                                    {filteredParents.map(parent => (
                                        <li key={parent.id} onClick={() => handleContactClick(parent)} className="flex items-center p-3 cursor-pointer hover:bg-gray-50">
                                            <img src={parent.avatarUrl} className="w-8 h-8 rounded-full object-cover" alt={parent.name} />
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-700">{parent.name}</p>
                                                <p className="text-xs text-gray-400">Padre/Madre</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {filteredGroups.length === 0 && filteredTeachers.length === 0 && filteredParents.length === 0 && (
                             <div className="p-4 text-center text-gray-500 text-sm">No se encontraron contactos.</div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const ChatWindow: React.FC<{ conversation: Conversation | null, messages: Message[], onSendMessage: (text: string) => void }> = ({ conversation, messages, onSendMessage }) => {
    const { currentUser } = useAppContext();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (newMessage.trim()) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    if (!conversation) return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 m-4">
            <ChatBubbleIcon />
            <p className="mt-2 font-medium">Selecciona una conversación o contacto para comenzar</p>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b flex items-center space-x-3 bg-gray-50">
                <img src={conversation.avatarUrl} alt={conversation.name} className="w-10 h-10 rounded-full border border-gray-200" />
                <div>
                    <h3 className="font-bold text-gray-800">{conversation.name}</h3>
                    {conversation.isGroup && <p className="text-xs text-gray-500">{conversation.participantIds.length} participantes</p>}
                </div>
            </div>
            <div className="flex-grow p-4 overflow-y-auto bg-slate-50 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        Esta es una nueva conversación. ¡Di hola!
                    </div>
                )}
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm ${msg.senderId === currentUser?.id ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                            <p>{msg.content}</p>
                            <p className={`text-[10px] mt-1 text-right ${msg.senderId === currentUser?.id ? 'text-blue-200' : 'text-gray-400'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t bg-white">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
                    <Input
                        placeholder="Escribe un mensaje..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        className="bg-transparent border-none focus:ring-0 px-0 shadow-none text-sm"
                    />
                    <button onClick={handleSend} className={`p-2 rounded-full transition-colors ${newMessage.trim() ? 'text-blue-600 hover:bg-blue-100' : 'text-gray-400 cursor-default'}`}>
                        <SendIcon/>
                    </button>
                </div>
            </div>
        </div>
    );
};

const SocialFeed: React.FC<{ posts: MediaPost[], users: Map<string, User>, onUpdate: () => void }> = ({ posts, users, onUpdate }) => {
    const { currentUser } = useAppContext();

    const handleLike = async (postId: string) => {
        if (!currentUser) return;
        await api.toggleLikeOnPost(postId, currentUser.id);
        onUpdate();
    };

    return (
        <div className="space-y-6 overflow-y-auto h-full p-2">
            {posts.map(post => {
                const author = users.get(post.authorId);
                const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
                const isOfficial = author?.role === Role.SchoolAdmin || author?.role === Role.Teacher;

                return (
                    <Card key={post.id}>
                        <CardHeader className="flex items-center space-x-3 pb-2">
                            <img src={author?.avatarUrl} alt={author?.name} className="w-10 h-10 rounded-full" />
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-800">{author?.name}</p>
                                    {isOfficial && <Badge color="blue" className="text-[10px] py-0">{author?.role === Role.SchoolAdmin ? 'Colegio' : 'Profesor'}</Badge>}
                                </div>
                                <p className="text-xs text-gray-500">{new Date(post.timestamp).toLocaleString()}</p>
                            </div>
                        </CardHeader>
                        <img src={post.imageUrl} alt={post.caption} className="w-full max-h-96 object-cover" />
                        <CardContent>
                            <p className="text-gray-800">{post.caption}</p>
                            <div className="flex justify-around items-center pt-2 mt-2 border-t">
                                <button onClick={() => handleLike(post.id)} className="flex items-center space-x-1 text-gray-600 hover:text-red-500"><HeartIcon filled={isLiked} /> <span>{post.likes.length}</span></button>
                                <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500"><ChatBubbleIcon /> <span>Comentar</span></button>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
            {posts.length === 0 && <div className="text-center text-gray-500 mt-10">No hay publicaciones recientes.</div>}
        </div>
    );
};

const PhotoGallery: React.FC<{ photos: MediaPost[], users: Map<string, User> }> = ({ photos, users }) => {
    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

    // Group photos by album name
    const albums = useMemo(() => {
        const groups: { [key: string]: MediaPost[] } = {};
        photos.forEach(photo => {
            // Only show photos from School Admin or Teachers in the official gallery
            const author = users.get(photo.authorId);
            if (author && (author.role === Role.SchoolAdmin || author.role === Role.Teacher)) {
                const albumName = photo.albumName || 'General';
                if (!groups[albumName]) groups[albumName] = [];
                groups[albumName].push(photo);
            }
        });
        return groups;
    }, [photos, users]);

    if (selectedAlbum) {
        const albumPhotos = albums[selectedAlbum] || [];
        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center mb-4 p-2">
                    <Button variant="secondary" size="sm" onClick={() => setSelectedAlbum(null)}>
                        <BackIcon /> <span className="ml-2">Volver a Álbumes</span>
                    </Button>
                    <h2 className="ml-4 text-xl font-bold text-gray-800">{selectedAlbum}</h2>
                </div>
                <div className="overflow-y-auto flex-grow p-2">
                    {albumPhotos.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {albumPhotos.map(photo => (
                                <div key={photo.id} className="relative group">
                                    <img src={photo.imageUrl} alt={photo.caption} className="w-full h-40 object-cover rounded-lg shadow-sm" />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 text-white text-center p-2">
                                            <p className="text-xs truncate mb-2">{photo.caption}</p>
                                            <a href={photo.imageUrl} download={`foto_${photo.id}.jpg`}>
                                                <Button variant="secondary" size="sm" className="bg-white text-black"><DownloadIcon /></Button>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center mt-10">Este álbum está vacío.</p>
                    )}
                </div>
            </div>
        );
    }

    const albumNames = Object.keys(albums);

    return (
        <div className="overflow-y-auto h-full p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Álbumes de Fotos del Colegio</h2>
            {albumNames.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {albumNames.map(name => {
                        const coverPhoto = albums[name][0]?.imageUrl;
                        const count = albums[name].length;
                        return (
                            <div key={name} onClick={() => setSelectedAlbum(name)} className="cursor-pointer group">
                                <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all border border-gray-200">
                                    {coverPhoto ? (
                                        <img src={coverPhoto} alt={name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-300">
                                            <FolderIcon />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                        <p className="text-white font-semibold truncate text-sm">{name}</p>
                                        <p className="text-gray-300 text-xs">{count} fotos</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center text-gray-500 mt-20">
                    <FolderIcon />
                    <p className="mt-2">No hay álbumes disponibles aún.</p>
                </div>
            )}
        </div>
    );
};

const EventsSidebar: React.FC<{ activities: Activity[], onViewActivity: (activity: Activity) => void, onNavigate: (view: string) => void }> = ({ activities, onViewActivity, onNavigate }) => {
    const upcoming = activities
        .filter(act => new Date(act.startDate) > new Date())
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 5);

    const getDuration = (start: string, end: string): string => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (startDate.toDateString() !== endDate.toDateString() || diffHours > 10) {
            return "Todo el día";
        }
        return `${diffHours.toFixed(1)} horas`;
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader><h3 className="font-semibold">Próximos Eventos</h3></CardHeader>
            <CardContent className="flex-grow overflow-y-auto flex flex-col">
                <ul className="space-y-4 flex-grow">
                    {upcoming.map(act => {
                        const date = new Date(act.startDate);
                        return (
                            <li key={act.id} className="flex space-x-4 cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition-colors" onClick={() => onViewActivity(act)}>
                                <div className="flex-shrink-0 text-center bg-blue-100 text-blue-800 rounded-lg p-2 w-16 group-hover:bg-blue-200 transition-colors">
                                    <p className="text-xs font-bold uppercase">{date.toLocaleString('es-ES', { month: 'short' })}</p>
                                    <p className="text-2xl font-bold">{date.getDate()}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm group-hover:text-blue-600 transition-colors">{act.name}</p>
                                    <p className="text-xs text-gray-500">{getDuration(act.startDate, act.endDate)}</p>
                                </div>
                            </li>
                        )
                    })}
                    {upcoming.length === 0 && <li className="text-sm text-gray-500 text-center">No hay eventos próximos.</li>}
                </ul>
                <div className="pt-4 border-t mt-4">
                    <Button variant="secondary" className="w-full flex items-center justify-center" onClick={() => onNavigate('Actividades')}>
                        <CalendarIcon />
                        <span className="ml-2">Ver todas las actividades</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};


// --- Main Component ---

interface ParentCommunicationViewProps {
    onNavigate?: (view: string) => void;
}

export const ParentCommunicationView: React.FC<ParentCommunicationViewProps> = ({ onNavigate = () => {} }) => {
    const { currentUser } = useAppContext();
    const [centerView, setCenterView] = useState<'chat' | 'feed' | 'gallery'>('chat');
    
    // Data states
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [posts, setPosts] = useState<MediaPost[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [users, setUsers] = useState<Map<string, User>>(new Map());
    const [students, setStudents] = useState<Student[]>([]);
    
    // Directory Lists
    const [parents, setParents] = useState<User[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    
    // Activity Details Modal State
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    const fetchData = useCallback(async () => {
        if (!currentUser || !currentUser.schoolId) return;
        const [convos, postsData, activitiesData, usersData, studentsData, parentsData, staffData] = await Promise.all([
            api.getConversationsForUser(currentUser.id),
            api.getMediaPosts(currentUser.schoolId),
            api.getActivitiesBySchool(currentUser.schoolId),
            api.getUsers(),
            api.getStudentsByParent(currentUser.id),
            api.getParentsBySchool(currentUser.schoolId),
            api.getStaffBySchool(currentUser.schoolId),
        ]);

        const sortedConvos = convos.sort((a,b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());
        setConversations(sortedConvos);
        setPosts(postsData);
        setActivities(activitiesData);
        setUsers(new Map(usersData.map(u => [u.id, u])));
        setStudents(studentsData);
        setParents(parentsData);
        setTeachers(staffData); 

        if (sortedConvos.length > 0 && !selectedConversation && centerView === 'chat') {
            handleConversationSelect(sortedConvos[0]);
        }
    }, [currentUser, selectedConversation, centerView]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleConversationSelect = async (conversation: Conversation) => {
        setSelectedConversation(conversation);
        // Switch to chat view if not already
        if(centerView !== 'chat') setCenterView('chat');
        const msgs = await api.getMessagesForConversation(conversation.id);
        setMessages(msgs);
    };
    
    const handleCreateChat = async (targetUserId: string, targetName: string) => {
        if (!currentUser) return;
        
        try {
            const newConvo = await api.createGroupConversation(currentUser.id, targetName, [targetUserId]);
            setConversations(prev => [newConvo, ...prev]);
            handleConversationSelect(newConvo);
        } catch (e) {
            alert("Error al iniciar conversación.");
        }
    };

    const handleSendMessage = async (text: string) => {
        if (!selectedConversation || !currentUser) return;
        await api.sendMessage(selectedConversation.id, currentUser.id, text);
        
        // Refresh messages and conversation list
        const [msgs, convos] = await Promise.all([
            api.getMessagesForConversation(selectedConversation.id),
            api.getConversationsForUser(currentUser.id)
        ]);
        setMessages(msgs);
        setConversations(convos.sort((a,b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()));
    };

    return (
        <div className="space-y-4">
             <h1 className="text-3xl font-bold text-gray-800">Centro de Comunicación</h1>
             <div className="flex h-[44rem] gap-6">
                {/* Left Column - Chat List & Directory */}
                <div className="w-1/4 min-w-[250px] hidden lg:block">
                    <ChatList 
                        conversations={conversations} 
                        selected={selectedConversation} 
                        onSelect={handleConversationSelect}
                        parents={parents}
                        teachers={teachers}
                        currentUser={currentUser}
                        onCreateChat={handleCreateChat}
                    />
                </div>

                {/* Center Column - Content */}
                <div className="flex-grow flex flex-col lg:w-1/2">
                    <Card className="h-full flex flex-col">
                        <CardHeader className="p-0">
                             <div className="flex border-b bg-gray-50 rounded-t-xl">
                                <button onClick={() => setCenterView('chat')} className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${centerView === 'chat' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>Chat</button>
                                <button onClick={() => setCenterView('feed')} className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${centerView === 'feed' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>Social</button>
                                <button onClick={() => setCenterView('gallery')} className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${centerView === 'gallery' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}>Galería del Colegio</button>
                            </div>
                        </CardHeader>
                        <div className="flex-grow overflow-hidden p-1 bg-slate-50">
                           {centerView === 'chat' && <ChatWindow conversation={selectedConversation} messages={messages} onSendMessage={handleSendMessage} />}
                           {centerView === 'feed' && <SocialFeed posts={posts} users={users} onUpdate={fetchData} />}
                           {centerView === 'gallery' && <PhotoGallery photos={posts} users={users} />}
                        </div>
                    </Card>
                </div>

                {/* Right Column - Events */}
                <div className="w-1/4 min-w-[250px] hidden xl:block">
                    <EventsSidebar 
                        activities={activities} 
                        onViewActivity={setSelectedActivity}
                        onNavigate={onNavigate}
                    />
                </div>
            </div>
            
            {selectedActivity && (
                <ActivityDetailsModal 
                    isOpen={!!selectedActivity}
                    onClose={() => setSelectedActivity(null)}
                    activity={selectedActivity}
                />
            )}
        </div>
    );
};
