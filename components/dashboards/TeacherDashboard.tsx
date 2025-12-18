
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Label } from '../ui/Label';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { api } from '../../services/mockApi';
import { useAppContext } from '../../context/AppContext';
import type { Student, AttendanceRecord, Star, PickupRecord, User, Conversation, Message } from '../../types';
import { Permission, AttendanceStatus, PickupType } from '../../types';
import { AttendanceView } from './teacher/AttendanceView';
import { Select } from '../ui/Select';
import { MyConsumptionView } from './teacher/MyConsumptionView';
import { ProfileView as TeacherProfileView } from './teacher/ProfileView';

const BEEP_SOUND_DATA_URL = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU9vT19PAAEBAgMBAgMFAgcEBgAFAgAABwYDBAUDAgEAAQEDAwYHBAMBAAECBAMHBgYBAAECAwYHBgYBAQECAwQFBgUDAQEAAQIDBQUGBgYBAQABAQMFBgcHBgEBAAABAQMFBgcHBgECAQABAQMEBgYHBgIBAQACAgQEBgcHBQABAQECBAcHBgUC';

const SoundOnIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 8.464a5 5 0 000 7.072m0 0L3 20v-8a9 9 0 016-8h1l2 3" /></svg>;
const SoundOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.858 5.858A10.026 10.026 0 004 12c0 2.21.894 4.21 2.343 5.657m11.314-11.314a10.026 10.026 0 012.343 5.657c0 2.21-.894 4.21-2.343 5.657m-1.414-1.414A6.01 6.01 0 0116 12c0 1.325-.448 2.536-1.195 3.536m-7.61-7.61A6.01 6.01 0 008 12c0 1.325.448 2.536 1.195 3.536M12 12l6 6m-6-6l-6-6" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;

const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

const AwardStarModal: React.FC<{ student: Student, isOpen: boolean, onClose: () => void, onAwarded: () => void }> = ({ student, isOpen, onClose, onAwarded }) => {
    const { currentUser } = useAppContext();
    const { t } = useTranslation();
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!reason || !currentUser) return;
        setIsSubmitting(true);
        await api.awardStar(student.id, reason, currentUser.id);
        setIsSubmitting(false);
        onAwarded();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Premiar a ${student.name}`} footer={
            <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Premiando...' : 'Otorgar Estrella'}</Button>
        }>
            <Label htmlFor="reason">Motivo del reconocimiento</Label>
            <Input id="reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="Ej: Excelente participación en clase" />
        </Modal>
    );
};

const AddNoteModal: React.FC<{ student: Student, isOpen: boolean, onClose: () => void, onSaved: () => void }> = ({ student, isOpen, onClose, onSaved }) => {
    const { currentUser } = useAppContext();
    const { t } = useTranslation();
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!note || !currentUser) return;
        setIsSubmitting(true);
        await api.addInternalNote(student.id, note, currentUser.id);
        setIsSubmitting(false);
        onSaved();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Añadir nota interna para ${student.name}`} footer={
            <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar Nota'}</Button>
        }>
            <Label htmlFor="note">Nota (solo visible para personal)</Label>
            <Textarea id="note" value={note} onChange={e => setNote(e.target.value)} rows={4} />
        </Modal>
    );
};

const DashboardHome: React.FC<{ students: Student[] }> = ({ students }) => {
    const { t } = useTranslation();
    return (
        <Card>
            <CardHeader><h2 className="text-xl font-semibold">{t('teacher.daySummary')}</h2></CardHeader>
            <CardContent>
                <p>{t('teacher.studentCount', { count: students.length })}</p>
            </CardContent>
        </Card>
    );
};

const PickupView: React.FC<{ students: Student[] }> = ({ students }) => {
    const { t } = useTranslation();
    const { currentUser } = useAppContext();
    const [activeTab, setActiveTab] = useState<'today' | 'reports'>('today');
    const [isSoundOn, setIsSoundOn] = useState(true);
    const [livePickups, setLivePickups] = useState<{ studentId: string, studentName: string, parentName: string, eta: number }[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [selectedParent, setSelectedParent] = useState<string>('');
    const [otherParentName, setOtherParentName] = useState('');
    const [reportStartDate, setReportStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [reportData, setReportData] = useState<PickupRecord[]>([]);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    
    const audioRef = useRef<HTMLAudioElement>(null);
    const prevLivePickupsCount = useRef(0);

    useEffect(() => {
        if (students.length > 0 && !selectedStudentId) {
            setSelectedStudentId(students[0].id);
        }
    }, [students, selectedStudentId]);
    
    useEffect(() => {
        setSelectedParent('');
        setOtherParentName('');
    }, [selectedStudentId]);

    useInterval(async () => {
        if (!currentUser) return;
        const liveData = await api.getLivePickupStatusForTeacher(currentUser.id);
        setLivePickups(liveData);
    }, 5000);

    useEffect(() => {
        if (isSoundOn && livePickups.length > prevLivePickupsCount.current) {
            audioRef.current?.play();
        }
        prevLivePickupsCount.current = livePickups.length;
    }, [livePickups, isSoundOn]);

    const handleRecordPickup = async (type: PickupType, studentId: string, pickupPerson: string) => {
        if (!currentUser || !studentId || !pickupPerson) {
            alert("Por favor seleccione un estudiante y especifique quién lo retira.");
            return;
        }
        await api.recordPickup(currentUser.id, studentId, pickupPerson, type);
        setOtherParentName('');
        setSelectedParent('');
    };

    const handleGenerateReport = async () => {
        if (!currentUser) return;
        setIsGeneratingReport(true);
        const data = await api.getPickupHistoryForReport(currentUser.id, reportStartDate, reportEndDate);
        setReportData(data);
        setIsGeneratingReport(false);
    };

    const handleExportCSV = () => {
        if (reportData.length === 0) return;
        const headers = ["Fecha", "Hora", "Estudiante", "Recogido por", "Tipo", "Minutos Tarde"];
        const rows = reportData.map(record => {
            const studentName = students.find(s => s.id === record.studentId)?.name || 'Desconocido';
            const pickupDateTime = new Date(record.pickupTime);
            const date = pickupDateTime.toLocaleDateString('es-DO');
            const time = pickupDateTime.toLocaleTimeString('es-DO');
            
            return [
                date,
                time,
                `"${studentName.replace(/"/g, '""')}"`,
                `"${record.parentName.replace(/"/g, '""')}"`,
                record.pickupType,
                record.minutesLate
            ].join(',');
        });
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `reporte_recogidas_${reportStartDate}_a_${reportEndDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const selectedStudentObject = students.find(s => s.id === selectedStudentId);
    const authorizedPickups = selectedStudentObject?.authorizedPickups || [];

    return (
        <div>
            <audio ref={audioRef} src={BEEP_SOUND_DATA_URL} preload="auto" />
            <div className="flex border-b mb-4">
                <button onClick={() => setActiveTab('today')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'today' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>{t('teacher.pickup.live')}</button>
                <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'reports' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>{t('teacher.pickup.reports')}</button>
            </div>

            {activeTab === 'today' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">{t('teacher.pickup.live')}</h2>
                            <button onClick={() => setIsSoundOn(!isSoundOn)} className="text-gray-500">{isSoundOn ? <SoundOnIcon /> : <SoundOffIcon />}</button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {livePickups.length > 0 ? livePickups.map(p => (
                                <div key={p.studentId} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold">{p.studentName}</p>
                                            <p className="text-sm text-gray-600">Padre/Madre: {p.parentName}</p>
                                        </div>
                                        <Badge color="blue">{p.eta} min</Badge>
                                    </div>
                                    <Button className="w-full mt-3" onClick={() => handleRecordPickup(PickupType.Notified, p.studentId, p.parentName)}>{t('teacher.pickup.notified')}</Button>
                                </div>
                            )) : <p className="text-center text-gray-500 py-8">Nadie ha notificado su llegada aún.</p>}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><h2 className="text-xl font-semibold">{t('teacher.pickup.scheduled')}</h2></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="studentSelect">{t('teacher.pickup.student')}</Label>
                                <Select id="studentSelect" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}>{students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</Select>
                            </div>
                            <div>
                                <Label htmlFor="parentName">{t('teacher.pickup.parent')}</Label>
                                <Select id="parentName" value={selectedParent} onChange={e => setSelectedParent(e.target.value)}>
                                    <option value="">Seleccione...</option>
                                    {authorizedPickups.map(p => <option key={p.id} value={p.fullName}>{p.fullName}</option>)}
                                    <option value="other">{t('teacher.pickup.other')}</option>
                                </Select>
                            </div>
                            {selectedParent === 'other' && (
                                <div>
                                    <Label htmlFor="otherParentName">{t('teacher.pickup.other')}</Label>
                                    <Input id="otherParentName" value={otherParentName} onChange={e => setOtherParentName(e.target.value)} placeholder="Nombre de quien retira"/>
                                </div>
                            )}
                            <Button className="w-full" onClick={() => handleRecordPickup(PickupType.Scheduled, selectedStudentId, selectedParent === 'other' ? otherParentName : selectedParent)}>{t('teacher.pickup.register')}</Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'reports' && (
                <Card>
                    <CardHeader><h2 className="text-xl font-semibold">{t('teacher.pickup.reports')}</h2></CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-4 pb-4 border-b">
                            <div><Label>{t('common.date')}:</Label><Input type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} /></div>
                            <div><Label>Hasta:</Label><Input type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)} /></div>
                            <Button onClick={handleGenerateReport} disabled={isGeneratingReport} className="self-end">{isGeneratingReport ? 'Generando...' : 'Generar Reporte'}</Button>
                            <Button onClick={handleExportCSV} disabled={reportData.length === 0} variant="secondary" className="self-end">{t('common.exportCSV')}</Button>
                        </div>
                        <div className="overflow-x-auto max-h-96">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0"><tr className="text-left text-xs font-medium text-gray-500 uppercase">
                                    <th className="px-4 py-2">{t('common.date')}</th><th className="px-4 py-2">Hora</th><th className="px-4 py-2">{t('teacher.pickup.student')}</th><th className="px-4 py-2">Recogido por</th><th className="px-4 py-2">Tipo</th><th className="px-4 py-2">Tardanza (min)</th>
                                </tr></thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reportData.map(r => (
                                        <tr key={r.id} className="text-sm">
                                            <td className="px-4 py-2">{new Date(r.pickupTime).toLocaleDateString()}</td><td className="px-4 py-2">{new Date(r.pickupTime).toLocaleTimeString()}</td>
                                            <td className="px-4 py-2">{students.find(s => s.id === r.studentId)?.name}</td><td className="px-4 py-2">{r.parentName}</td><td className="px-4 py-2"><Badge color={r.pickupType === PickupType.Notified ? 'blue' : 'gray'}>{r.pickupType}</Badge></td><td className="px-4 py-2">{r.minutesLate > 0 ? r.minutesLate : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {reportData.length === 0 && <p className="text-center text-gray-500 p-4">{t('common.noData')}</p>}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

const MyCoursesView: React.FC<{ students: Student[] }> = ({ students }) => {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isStarModalOpen, setIsStarModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

    const handleAwardStar = (student: Student) => {
        setSelectedStudent(student);
        setIsStarModalOpen(true);
    };

    const handleAddNote = (student: Student) => {
        setSelectedStudent(student);
        setIsNoteModalOpen(true);
    };
    
    const refreshStudentData = () => {
        console.log("Refreshing student data...");
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map(student => (
                <Card key={student.id}>
                    <CardContent className="flex flex-col items-center text-center">
                        <img src={student.avatarUrl} alt={student.name} className="w-24 h-24 rounded-full object-cover" />
                        <h3 className="mt-4 font-semibold text-lg">{student.name}</h3>
                        <div className="mt-1 flex items-center space-x-1">
                            <StarIcon />
                            <span className="font-bold text-yellow-500">{(student.stars || []).length}</span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                            <Button size="sm" variant="secondary" onClick={() => handleAwardStar(student)}>Premiar</Button>
                            <Button size="sm" variant="secondary" onClick={() => handleAddNote(student)}>Nota Interna</Button>
                            <Button size="sm" variant="secondary">Ver Perfil</Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {isStarModalOpen && selectedStudent && <AwardStarModal student={selectedStudent} isOpen={isStarModalOpen} onClose={() => setIsStarModalOpen(false)} onAwarded={refreshStudentData} />}
            {isNoteModalOpen && selectedStudent && <AddNoteModal student={selectedStudent} isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} onSaved={refreshStudentData} />}
        </div>
    );
};

const CommunicationsView: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser } = useAppContext();
    const [students, setStudents] = useState<Student[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<Map<string, User>>(new Map());

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const studentToParentMap = useRef(new Map<string, string>());
    const parentToConversationMap = useRef(new Map<string, Conversation>());

    useEffect(() => {
        if (!currentUser) return;
        const fetchData = async () => {
            const [studentsData, convosData, usersData] = await Promise.all([
                api.getStudentsByTeacher(currentUser.id),
                api.getConversationsForUser(currentUser.id),
                api.getUsers()
            ]);
            
            setStudents(studentsData);
            setConversations(convosData);
            setUsers(new Map(usersData.map(u => [u.id, u])));

            studentToParentMap.current = new Map(studentsData.map(s => [s.id, s.parentId]));
            parentToConversationMap.current = new Map();
            convosData.forEach(c => {
                const parentId = c.participantIds.find(id => id !== currentUser.id);
                if (parentId) parentToConversationMap.current.set(parentId, c);
            });
        };
        fetchData();
    }, [currentUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
        const parentId = studentToParentMap.current.get(student.id);
        const conv = parentId ? parentToConversationMap.current.get(parentId) : null;
        
        setCurrentConversation(conv || null);

        if (conv) {
            setIsLoadingMessages(true);
            api.getMessagesForConversation(conv.id).then(setMessages).finally(() => setIsLoadingMessages(false));
        } else {
            setMessages([]);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedStudent || !currentUser) return;

        let convToUse = currentConversation;
        if (!convToUse) {
            alert("No se puede iniciar una conversación. Contacte al administrador.");
            return;
        }

        const sentMessage = await api.sendMessage(convToUse.id, currentUser.id, newMessage.trim());
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
    };
    
    const handleQuickAction = (tag: string) => {
        setNewMessage(prev => `${tag} ${prev}`);
    }

    const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <Card className="flex h-[calc(100vh-200px)] overflow-hidden">
            {/* Student List */}
            <div className="w-1/3 border-r flex flex-col">
                <div className="p-4 border-b">
                    <Input placeholder={t('teacher.communication.search')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <ul className="overflow-y-auto">
                    {filteredStudents.map(student => {
                        const parentId = studentToParentMap.current.get(student.id);
                        const conv = parentId ? parentToConversationMap.current.get(parentId) : null;
                        return (
                            <li key={student.id} onClick={() => handleSelectStudent(student)} className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${selectedStudent?.id === student.id ? 'bg-primary-light' : ''}`}>
                                <img src={student.avatarUrl} alt={student.name} className="w-12 h-12 rounded-full" />
                                <div className="ml-3 flex-grow overflow-hidden">
                                    <p className="font-semibold">{student.name}</p>
                                    <p className="text-sm text-text-secondary truncate">{conv?.lastMessage.text || 'Sin mensajes'}</p>
                                </div>
                                {conv?.unreadCount && conv.unreadCount > 0 && <Badge color="blue">{conv.unreadCount}</Badge>}
                            </li>
                        );
                    })}
                </ul>
            </div>
            
            {/* Message Area */}
            <div className="w-2/3 flex flex-col bg-surface">
                {selectedStudent ? (
                    <>
                        <div className="p-4 border-b flex items-center bg-gray-50/70">
                            <img src={selectedStudent.avatarUrl} alt={selectedStudent.name} className="w-10 h-10 rounded-full" />
                            <h3 className="text-lg font-semibold ml-3">{t('teacher.communication.conversationWith', { name: selectedStudent.name })}</h3>
                        </div>
                        <div className="flex-grow p-4 overflow-y-auto bg-background">
                            {isLoadingMessages ? <p>{t('common.loading')}</p> : messages.map(msg => {
                                const sender = users.get(msg.senderId);
                                const isMe = msg.senderId === currentUser?.id;
                                return (
                                    <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
                                        {!isMe && <img src={sender?.avatarUrl} className="w-6 h-6 rounded-full" />}
                                        <div className={`max-w-md p-3 rounded-2xl ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-surface text-text-primary rounded-bl-none shadow-sm'}`}>
                                            <p>{msg.content}</p>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t bg-surface">
                             <Textarea 
                                placeholder={t('teacher.communication.placeholder')} 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                                rows={3}
                                className="bg-secondary-DEFAULT border-none focus:bg-white"
                            />
                            <div className="flex justify-between items-center mt-2">
                                <div className="space-x-2">
                                    <Button size="sm" variant="secondary" onClick={() => handleQuickAction(`[${t('teacher.communication.quick.homework')}]`)}>{t('teacher.communication.quick.homework')}</Button>
                                    <Button size="sm" variant="secondary" onClick={() => handleQuickAction(`[${t('teacher.communication.quick.note')}]`)}>{t('teacher.communication.quick.note')}</Button>
                                    <Button size="sm" variant="secondary" onClick={() => handleQuickAction(`[${t('teacher.communication.quick.request')}]`)}>{t('teacher.communication.quick.request')}</Button>
                                </div>
                                <Button onClick={handleSendMessage} disabled={!currentConversation}>{t('common.send')}</Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-text-secondary">
                        <p>Selecciona un estudiante para ver la conversación.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export const TeacherDashboard: React.FC<{ activeView?: string; setNotificationCounts?: (counts: any) => void }> = ({ activeView = 'dashboard', setNotificationCounts }) => {
    const { t } = useTranslation();
    const { currentUser } = useAppContext();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    useEffect(() => {
        if (currentUser) {
            api.getPermissionsForUser(currentUser.id).then(p => setPermissions(p as Permission[]));
            api.getStudentsByTeacher(currentUser.id).then(setStudents);
             if (setNotificationCounts) {
                api.getConversationsForUser(currentUser.id).then(convos => {
                    const unreadCount = convos.reduce((acc, c) => acc + c.unreadCount, 0);
                    setNotificationCounts((prev: any) => ({ ...prev, 'communications': unreadCount }));
                });
            }
        }
    }, [currentUser, setNotificationCounts]);

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <DashboardHome students={students} />;
            case 'pickup':
                if (permissions.includes(Permission.ViewPickupInfo)) {
                    return <PickupView students={students} />;
                }
                return <p>No tienes permiso para ver esta sección.</p>;
            case 'myCourses':
                return <MyCoursesView students={students} />;
            case 'myConsumption':
                return <MyConsumptionView />;
            case 'communications':
                 if (permissions.includes(Permission.SendCommunications)) {
                    return <CommunicationsView />;
                }
                return <p>No tienes permiso para enviar comunicados.</p>;
            case 'attendance':
                 if (permissions.includes(Permission.ManageAttendance)) {
                    return <AttendanceView students={students} />;
                }
                return <p>No tienes permiso para pasar asistencia.</p>;
            case 'myProfile':
                return <TeacherProfileView />;
            default:
                return <DashboardHome students={students} />;
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-display font-bold text-text-primary">{t(`sidebar.${activeView}`)}</h1>
            {renderContent()}
        </div>
    );
};
