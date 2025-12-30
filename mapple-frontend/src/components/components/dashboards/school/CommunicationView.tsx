
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import { Textarea } from '../../ui/Textarea';
import { Modal } from '../../ui/Modal';
import { Label } from '../../ui/Label';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import type { Conversation, Message, Circular, MediaPost, Activity, User, Comment, Status as ActivityStatus } from '../../../types';
import { Role } from '../../../types';
import { CircularModal } from '../../forms/CircularModal';
import { ShareCircularModal } from '../../forms/ShareCircularModal';
import { ActivityDetailsModal } from '../../forms/ActivityDetailsModal';
import { CreateGroupChatModal } from '../../forms/CreateGroupChatModal';

// --- SVG Icons ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>;
const PaperClipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const HeartIcon = ({ filled }: { filled: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${filled ? 'text-red-500' : 'text-gray-500'}`} fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>;
const ChatBubbleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>;
const UploadIcon = () => <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.099.164-1.157 4.224 4.272-1.124.167.105z" /></svg>;
const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z" /></svg>;


// --- New Tabs ---
const UpcomingActivitiesTab: React.FC = () => {
    const { currentUser } = useAppContext();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (currentUser?.schoolId) {
            setIsLoading(true);
            api.getActivitiesBySchool(currentUser.schoolId).then(allActivities => {
                const upcoming = allActivities
                    .filter(act => new Date(act.startDate) > new Date() && ['Confirmed', 'Pending'].includes(act.status))
                    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
                setActivities(upcoming);
                setIsLoading(false);
            });
        }
    }, [currentUser?.schoolId]);

    const handleViewDetails = (activity: Activity) => {
        setSelectedActivity(activity);
        setIsDetailsModalOpen(true);
    };
    
    if (isLoading) return <p className="text-center p-8">Cargando actividades...</p>;

    return (
        <>
            <Card>
                <CardHeader><h3 className="text-lg font-semibold">Próximas Actividades Planificadas</h3></CardHeader>
                <CardContent>
                    {activities.length > 0 ? (
                        <div className="space-y-4">
                            {activities.map(activity => (
                                <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                    <img src={activity.imageUrl} alt={activity.name} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                                    <div className="flex-grow">
                                        <p className="font-bold text-gray-800">{activity.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(activity.startDate).toLocaleString('es-DO', { dateStyle: 'long', timeStyle: 'short' })}
                                        </p>
                                    </div>
                                    <Button variant="secondary" onClick={() => handleViewDetails(activity)}>Ver Detalles</Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No hay actividades próximas planificadas.</p>
                    )}
                </CardContent>
            </Card>
            {isDetailsModalOpen && selectedActivity && (
                <ActivityDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    activity={selectedActivity}
                />
            )}
        </>
    );
};

const SocialTab: React.FC = () => {
    const { currentUser } = useAppContext();
    const [posts, setPosts] = useState<MediaPost[]>([]);
    const [users, setUsers] = useState<Map<string, User>>(new Map());
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        if (currentUser?.schoolId) {
            const [postsData, usersData] = await Promise.all([
                api.getMediaPosts(currentUser.schoolId),
                api.getUsers()
            ]);
            setPosts(postsData);
            setUsers(new Map(usersData.map(u => [u.id, u])));
        }
    }, [currentUser?.schoolId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handlePostCreated = () => {
        setIsUploadModalOpen(false);
        fetchData();
    }

    const PostCard: React.FC<{ post: MediaPost }> = ({ post }) => {
        const author = users.get(post.authorId);
        const [localPost, setLocalPost] = useState(post);
        const [comments, setComments] = useState<Comment[]>([]);
        const [showComments, setShowComments] = useState(false);
        const [newComment, setNewComment] = useState('');

        const handleLike = async () => {
            if (!currentUser) return;
            const updatedPost = await api.toggleLikeOnPost(localPost.id, currentUser.id);
            setLocalPost(updatedPost);
        };

        const handleToggleComments = () => {
            if (!showComments) {
                api.getCommentsForPost(localPost.id).then(setComments);
            }
            setShowComments(!showComments);
        };
        
        const handleAddComment = async (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && newComment.trim() && currentUser) {
                await api.addCommentToPost(localPost.id, currentUser.id, newComment.trim());
                setNewComment('');
                // Refresh comments
                api.getCommentsForPost(localPost.id).then(setComments);
            }
        };
        
        const isLiked = currentUser ? localPost.likes.includes(currentUser.id) : false;

        return (
            <Card className="max-w-xl mx-auto">
                <CardHeader className="flex items-center space-x-3">
                    <img src={author?.avatarUrl} alt={author?.name} className="w-10 h-10 rounded-full" />
                    <div>
                        <p className="font-semibold">{author?.name}</p>
                        <p className="text-xs text-gray-500">{new Date(localPost.timestamp).toLocaleString()}</p>
                    </div>
                </CardHeader>
                <img src={localPost.imageUrl} alt={localPost.caption} className="w-full" />
                <CardContent>
                    <p>{localPost.caption}</p>
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                        <span>{localPost.likes.length} Me gusta</span>
                        <span>{comments.length || 0} Comentarios</span>
                    </div>
                    <div className="flex justify-around items-center pt-2 mt-2 border-t">
                        <button onClick={handleLike} className="flex items-center space-x-1 text-gray-600 hover:text-red-500"><HeartIcon filled={isLiked} /> <span>Me gusta</span></button>
                        <button onClick={handleToggleComments} className="flex items-center space-x-1 text-gray-600 hover:text-blue-500"><ChatBubbleIcon /> <span>Comentar</span></button>
                        <button className="flex items-center space-x-1 text-gray-600 hover:text-green-500"><ShareIcon /> <span>Compartir</span></button>
                    </div>
                    {showComments && (
                        <div className="mt-4 space-y-2">
                            {comments.map(comment => {
                                const commentAuthor = users.get(comment.authorId);
                                return (
                                    <div key={comment.id} className="text-sm">
                                        <span className="font-semibold">{commentAuthor?.name}</span>
                                        <span className="ml-2 text-gray-700">{comment.text}</span>
                                    </div>
                                )
                            })}
                            <Input 
                                placeholder="Añade un comentario..." 
                                value={newComment} 
                                onChange={e => setNewComment(e.target.value)}
                                onKeyPress={handleAddComment}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div className="text-right">
                 <Button onClick={() => setIsUploadModalOpen(true)}>+ Subir Foto</Button>
            </div>
            {posts.map(post => <PostCard key={post.id} post={post} />)}
            {isUploadModalOpen && <UploadMediaModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onPostCreated={handlePostCreated} />}
        </div>
    );
};

const UploadMediaModal: React.FC<{ isOpen: boolean; onClose: () => void; onPostCreated: () => void; }> = ({ isOpen, onClose, onPostCreated }) => {
    const { currentUser } = useAppContext();
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!image || !caption || !currentUser?.schoolId) return;
        setIsUploading(true);
        await api.createMediaPost(currentUser.schoolId, currentUser.id, image, caption);
        setIsUploading(false);
        onPostCreated();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Subir Nueva Foto al Feed" footer={
            <Button onClick={handleSubmit} disabled={!image || !caption || isUploading}>{isUploading ? 'Subiendo...' : 'Publicar'}</Button>
        }>
            <div className="space-y-4">
                <div
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="space-y-1 text-center">
                    {image ? (
                        <img src={image} alt="Vista previa" className="mx-auto h-48 max-w-full object-contain rounded-md" />
                    ) : ( <> <UploadIcon /> <p className="text-sm text-gray-600">Haz clic para seleccionar una foto</p> </> )}
                    </div>
                </div>
                <input ref={fileInputRef} type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                <div>
                    <Label htmlFor="caption">Descripción</Label>
                    <Textarea id="caption" value={caption} onChange={e => setCaption(e.target.value)} placeholder="Escribe algo sobre la foto..." />
                </div>
            </div>
        </Modal>
    );
};

interface DisplayContact {
    id: string;
    type: 'group' | 'parent' | 'staff';
    name: string;
    avatarUrl: string;
    role?: string;
    conversationId?: string;
    lastMessage?: string;
    timestamp: string;
    unreadCount: number;
}

const ConversationsTab: React.FC = () => {
    const { currentUser } = useAppContext();
    const [displayContacts, setDisplayContacts] = useState<DisplayContact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<DisplayContact[]>([]);
    const [selectedContact, setSelectedContact] = useState<DisplayContact | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | 'groups' | 'parents' | 'staff'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        if (currentUser && currentUser.schoolId) {
            const [conversations, parents, staff] = await Promise.all([
                api.getConversationsForUser(currentUser.id),
                api.getParentsBySchool(currentUser.schoolId),
                api.getStaffBySchool(currentUser.schoolId),
            ]);

            const contacts: DisplayContact[] = [];

            // 1. Process Groups (From Conversations)
            conversations.filter(c => c.isGroup).forEach(group => {
                contacts.push({
                    id: group.id,
                    type: 'group',
                    name: group.name,
                    avatarUrl: group.avatarUrl,
                    conversationId: group.id,
                    lastMessage: group.lastMessage.text,
                    timestamp: group.lastMessage.timestamp,
                    unreadCount: group.unreadCount
                });
            });

            // 2. Process Parents
            parents.forEach(parent => {
                const conversation = conversations.find(c => !c.isGroup && c.participantIds.includes(parent.id));
                contacts.push({
                    id: parent.id, // User ID used for identification
                    type: 'parent',
                    name: parent.name,
                    avatarUrl: parent.avatarUrl,
                    role: 'Padre/Madre',
                    conversationId: conversation?.id, // Might be undefined
                    lastMessage: conversation?.lastMessage.text || '',
                    timestamp: conversation?.lastMessage.timestamp || '1970-01-01T00:00:00Z', // Default old date for sorting
                    unreadCount: conversation?.unreadCount || 0
                });
            });

            // 3. Process Staff (exclude self)
            staff.filter(u => u.id !== currentUser.id).forEach(member => {
                const conversation = conversations.find(c => !c.isGroup && c.participantIds.includes(member.id));
                contacts.push({
                    id: member.id,
                    type: 'staff',
                    name: member.name,
                    avatarUrl: member.avatarUrl,
                    role: member.role,
                    conversationId: conversation?.id,
                    lastMessage: conversation?.lastMessage.text || '',
                    timestamp: conversation?.lastMessage.timestamp || '1970-01-01T00:00:00Z',
                    unreadCount: conversation?.unreadCount || 0
                });
            });

            // Sort by timestamp descending
            contacts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setDisplayContacts(contacts);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        let result = displayContacts;

        if (activeFilter !== 'all') {
            // Filter logic matches the types used in DisplayContact
            if (activeFilter === 'groups') result = result.filter(c => c.type === 'group');
            if (activeFilter === 'parents') result = result.filter(c => c.type === 'parent');
            if (activeFilter === 'staff') result = result.filter(c => c.type === 'staff');
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(c => c.name.toLowerCase().includes(term));
        }

        setFilteredContacts(result);
    }, [displayContacts, activeFilter, searchTerm]);

    const handleContactSelect = async (contact: DisplayContact) => {
        setSelectedContact(contact);
        setMessages([]);
        if (contact.conversationId) {
            const msgs = await api.getMessagesForConversation(contact.conversationId);
            setMessages(msgs);
        } else {
            // No conversation yet - clear messages
            setMessages([]);
        }
    };
    
    const handleSendMessage = async () => {
        if (newMessage.trim() === '' || !selectedContact || !currentUser) return;
        
        let conversationId = selectedContact.conversationId;

        // If no conversation exists, we need to create one (Simulated here)
        if (!conversationId) {
            // In a real app, api.createPrivateConversation(userId)
            // Here we simulate it by creating a group of 2 or hijacking createGroupConversation
            try {
                // Use createGroupConversation as a proxy for private chat creation in mock
                const newConvo = await api.createGroupConversation(currentUser.id, selectedContact.name, [selectedContact.id]);
                conversationId = newConvo.id;
                // Update the contact in state to have this ID
                setDisplayContacts(prev => prev.map(c => c.id === selectedContact.id ? { ...c, conversationId: newConvo.id } : c));
                setSelectedContact(prev => prev ? { ...prev, conversationId: newConvo.id } : null);
            } catch (e) {
                alert("Error al crear la conversación.");
                return;
            }
        }

        await api.sendMessage(conversationId, currentUser.id, newMessage);
        setNewMessage('');
        // Refresh messages
        api.getMessagesForConversation(conversationId).then(setMessages);
        
        // Update sort order locally
        fetchData();
    };
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleGroupCreated = () => {
        setIsGroupModalOpen(false);
        setSelectedContact(null);
        fetchData();
    };

    const FilterBadge: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
        <button
            onClick={onClick}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
            {children}
        </button>
    );

    return (
        <>
            <div className="flex h-[calc(100vh-200px)]">
                {/* Conversation List */}
                <div className="w-1/3 border-r bg-white rounded-l-lg flex flex-col">
                    <div className="p-4 border-b">
                        <div className="flex justify-between items-center mb-3">
                            <div className="relative flex-grow mr-2">
                                <Input 
                                    placeholder="Buscar chat o usuario..." 
                                    className="pl-10" 
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <SearchIcon />
                                </div>
                            </div>
                            <Button size="sm" onClick={() => setIsGroupModalOpen(true)}>+</Button>
                        </div>
                        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
                            <FilterBadge active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>Todos</FilterBadge>
                            <FilterBadge active={activeFilter === 'groups'} onClick={() => setActiveFilter('groups')}>Grupos</FilterBadge>
                            <FilterBadge active={activeFilter === 'parents'} onClick={() => setActiveFilter('parents')}>Padres</FilterBadge>
                            <FilterBadge active={activeFilter === 'staff'} onClick={() => setActiveFilter('staff')}>Personal</FilterBadge>
                        </div>
                    </div>
                    <ul className="overflow-y-auto flex-grow">
                        {filteredContacts.map(contact => (
                            <li key={contact.id} onClick={() => handleContactSelect(contact)} className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${selectedContact?.id === contact.id ? 'bg-blue-50' : ''}`}>
                                <div className="relative">
                                    <img src={contact.avatarUrl} alt={contact.name} className="w-12 h-12 rounded-full" />
                                    {contact.type === 'group' && (
                                        <span className="absolute -bottom-1 -right-1 bg-gray-200 rounded-full p-0.5 border border-white">
                                            <span className="text-[10px] px-1">👥</span>
                                        </span>
                                    )}
                                </div>
                                <div className="ml-3 flex-grow overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold truncate text-sm">{contact.name}</p>
                                        {contact.timestamp !== '1970-01-01T00:00:00Z' && (
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(contact.timestamp).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">
                                        {contact.lastMessage || (contact.role ? contact.role : 'Iniciar conversación')}
                                    </p>
                                </div>
                                {contact.unreadCount > 0 && <Badge color="blue" className="ml-2">{contact.unreadCount}</Badge>}
                            </li>
                        ))}
                        {filteredContacts.length === 0 && (
                            <li className="p-4 text-center text-gray-500 text-sm">No se encontraron contactos.</li>
                        )}
                    </ul>
                </div>
                
                {/* Message Area */}
                <div className="w-2/3 flex flex-col bg-white rounded-r-lg">
                    {selectedContact ? (
                        <>
                            <div className="p-4 border-b flex items-center bg-gray-50">
                                <img src={selectedContact.avatarUrl} alt={selectedContact.name} className="w-10 h-10 rounded-full" />
                                <div className="ml-3">
                                    <h3 className="text-lg font-semibold">{selectedContact.name}</h3>
                                    {selectedContact.type !== 'group' && <p className="text-xs text-gray-500">{selectedContact.role}</p>}
                                </div>
                            </div>
                            <div className="flex-grow p-4 overflow-y-auto bg-white">
                                {messages.length === 0 ? (
                                    <div className="flex h-full items-center justify-center flex-col text-gray-400">
                                        <p>No hay mensajes aún.</p>
                                        <p className="text-sm">Envía un mensaje para iniciar la conversación.</p>
                                    </div>
                                ) : (
                                    messages.map(msg => (
                                         <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'} mb-4`}>
                                             <div className={`max-w-md p-3 rounded-lg ${msg.senderId === currentUser?.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                                 {msg.type === 'payment_link' ? (
                                                     <div className="w-64">
                                                         <p className="font-bold">Solicitud de Pago</p>
                                                         <p>Actividad: {msg.paymentDetails?.activityName}</p>
                                                         <p>Monto: ${msg.paymentDetails?.amount.toFixed(2)} {msg.paymentDetails?.currency}</p>
                                                         <Button className="w-full mt-2 bg-white text-blue-600 hover:bg-gray-100">Pagar ahora</Button>
                                                     </div>
                                                 ) : (
                                                    <p>{msg.content}</p>
                                                 )}
                                                 <p className={`text-[10px] mt-1 text-right ${msg.senderId === currentUser?.id ? 'text-blue-100' : 'text-gray-500'}`}>
                                                     {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                 </p>
                                             </div>
                                         </div>
                                    ))
                                )}
                                 <div ref={messagesEndRef} />
                            </div>
                            <div className="p-4 border-t flex items-center space-x-3 bg-gray-50">
                                <button className="text-gray-500 hover:text-gray-700"><ImageIcon /></button>
                                <button className="text-gray-500 hover:text-gray-700"><PaperClipIcon /></button>
                                <Input 
                                    placeholder="Escribe un mensaje..." 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    className="bg-white"
                                />
                                <Button onClick={handleSendMessage}><SendIcon/></Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50">
                            <div className="text-center">
                                <ChatBubbleIcon />
                                <p className="mt-2">Selecciona un contacto o grupo para chatear.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <CreateGroupChatModal 
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                onSave={handleGroupCreated}
            />
        </>
    );
};

const CircularsTab: React.FC = () => {
    const { currentUser } = useAppContext();
    const [circulars, setCirculars] = useState<Circular[]>([]);
    const [isCircularModalOpen, setIsCircularModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedCircular, setSelectedCircular] = useState<Circular | null>(null);

    const fetchCirculars = useCallback(async () => {
        if (currentUser?.schoolId) {
            const data = await api.getCirculars(currentUser.schoolId);
            setCirculars(data);
        }
    }, [currentUser?.schoolId]);

    useEffect(() => {
        fetchCirculars();
    }, [fetchCirculars]);
    
    const handleCreate = () => {
        setSelectedCircular(null);
        setIsCircularModalOpen(true);
    };

    const handleEdit = (circular: Circular) => {
        setSelectedCircular(circular);
        setIsCircularModalOpen(true);
    };
    
    const handleShare = (circular: Circular) => {
        setSelectedCircular(circular);
        setIsShareModalOpen(true);
    };

    const handleSave = () => {
        fetchCirculars();
        setIsCircularModalOpen(false);
        setSelectedCircular(null);
    };

    const handleCloseModals = () => {
        setIsCircularModalOpen(false);
        setIsShareModalOpen(false);
        setSelectedCircular(null);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Circulares</h3>
                    <Button onClick={handleCreate}>+ Nueva Circular</Button>
                </CardHeader>
                <CardContent>
                    {circulars.length > 0 ? (
                        <ul className="space-y-4">
                            {circulars.map(circular => (
                                <li key={circular.id} className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-800">{circular.title}</h4>
                                            <p className="text-xs text-gray-500">
                                                Publicado el {new Date(circular.timestamp).toLocaleDateString()}
                                            </p>
                                            <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{circular.content}</p>
                                        </div>
                                        <div className="flex space-x-2 flex-shrink-0 ml-4">
                                            <Button variant="secondary" className="text-xs" onClick={() => handleShare(circular)}>Compartir</Button>
                                            <Button variant="secondary" className="text-xs" onClick={() => handleEdit(circular)}>Editar</Button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No hay circulares publicadas.</p>
                    )}
                </CardContent>
            </Card>

            {isCircularModalOpen && (
                <CircularModal 
                    isOpen={isCircularModalOpen}
                    onClose={handleCloseModals}
                    onSave={handleSave}
                    circular={selectedCircular}
                />
            )}

            {isShareModalOpen && selectedCircular && (
                <ShareCircularModal
                    isOpen={isShareModalOpen}
                    onClose={handleCloseModals}
                    circular={selectedCircular}
                />
            )}
        </>
    );
};


export const CommunicationView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'social' | 'circulars' | 'conversations'>('upcoming');
    
    return (
        <div className="space-y-4">
             <div className="flex border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'upcoming' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Próximas Actividades
                </button>
                 <button 
                    onClick={() => setActiveTab('social')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'social' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Social
                </button>
                <button 
                    onClick={() => setActiveTab('circulars')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'circulars' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Circulares
                </button>
                <button 
                    onClick={() => setActiveTab('conversations')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'conversations' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Conversaciones
                </button>
            </div>
            {activeTab === 'upcoming' && <UpcomingActivitiesTab />}
            {activeTab === 'social' && <SocialTab />}
            {activeTab === 'circulars' && <CircularsTab />}
            {activeTab === 'conversations' && <ConversationsTab />}
        </div>
    );
}
