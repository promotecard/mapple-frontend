
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { api } from '../../services/mockApi';
import type { PaymentGroup, User, PaymentTransaction } from '../../types';
import { PaymentStatus } from '../../types';

interface PaymentGroupDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: PaymentGroup;
}

interface MemberStatus {
    user: User;
    status: 'Paid' | 'Pending' | 'Overdue';
    lastPaymentDate?: string;
}

const ExcelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.99.605 1.973.997 3.277.997 3.181 0 5.768-2.587 5.768-5.766s-2.587-5.766-5.768-5.766zm5.156 7.83c-.248.697-1.172 1.216-1.746 1.275-.42.043-.96.19-3.207-.737-2.246-.926-3.725-3.298-3.84-3.45-.115-.152-.916-1.216-.916-2.32 0-1.103.572-1.646.775-1.868.203-.223.53-.278.706-.278.176 0 .352.002.529.01.187.009.44.021.66.55.223.529.761 1.868.828 2.004.068.137.113.298.012.498-.1.199-.15.322-.298.498-.148.176-.312.393-.445.528-.148.149-.303.311-.13.607.174.297.768 1.267 1.649 2.053 1.136 1.014 2.091 1.328 2.388 1.477.298.148.474.127.65-.074.176-.201.761-.885.965-1.189.203-.303.406-.252.683-.151.277.101 1.752.826 2.053.976.3.152.502.227.573.353.071.126.071.732-.177 1.429z" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;

export const PaymentGroupDetailsModal: React.FC<PaymentGroupDetailsModalProps> = ({ isOpen, onClose, group }) => {
    const [members, setMembers] = useState<MemberStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Selection State
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

    // Reminder Modal State (Single)
    const [isReminderOpen, setIsReminderOpen] = useState(false);
    const [reminderTarget, setReminderTarget] = useState<MemberStatus | null>(null);
    const [reminderMessage, setReminderMessage] = useState('');
    
    // Bulk Reminder Modal State
    const [isBulkReminderOpen, setIsBulkReminderOpen] = useState(false);
    const [bulkMessage, setBulkMessage] = useState('');
    
    // Channels Config (Shared for single/bulk UI, reset on open)
    const [channels, setChannels] = useState({
        email: true,
        app: true,
        whatsapp: false
    });
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (isOpen && group) {
            const loadDetails = async () => {
                setIsLoading(true);
                const [parents, transactions] = await Promise.all([
                    api.getParentsBySchool(group.schoolId),
                    api.getPaymentTransactionsBySchool(group.schoolId)
                ]);

                const statusList: MemberStatus[] = [];
                const now = new Date();
                const dueDate = new Date(group.nextDueDate);

                group.memberParentIds.forEach(parentId => {
                    const parent = parents.find(p => p.id === parentId);
                    if (!parent) return;

                    const recentTx = transactions.find(t => 
                        t.parentId === parentId && 
                        t.referenceId === group.recurringPaymentId &&
                        (t.status === PaymentStatus.Paid || t.status === PaymentStatus.Confirmed)
                    );

                    let status: 'Paid' | 'Pending' | 'Overdue' = 'Pending';
                    if (recentTx) {
                        status = 'Paid';
                    } else if (now > dueDate) {
                        status = 'Overdue';
                    }

                    statusList.push({
                        user: parent,
                        status,
                        lastPaymentDate: recentTx?.date
                    });
                });

                setMembers(statusList);
                setSelectedMemberIds([]); // Reset selections
                setIsLoading(false);
            };
            loadDetails();
        }
    }, [isOpen, group]);

    // --- Selection Logic ---

    const handleSelectMember = (id: string) => {
        setSelectedMemberIds(prev => 
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            // Select only pending/overdue members
            const actionableIds = members
                .filter(m => m.status !== 'Paid')
                .map(m => m.user.id);
            setSelectedMemberIds(actionableIds);
        } else {
            setSelectedMemberIds([]);
        }
    };

    // --- Reminder Logic ---

    const handleOpenReminder = (member: MemberStatus) => {
        setReminderTarget(member);
        const statusText = member.status === 'Overdue' ? 'vencido' : 'pendiente';
        setReminderMessage(
            `Estimado/a ${member.user.name},\n\nLe recordamos amablemente que el pago correspondiente a "${group.name}" se encuentra ${statusText}. Agradecemos su pronta atención.\n\nAtentamente,\nLa Administración.`
        );
        setChannels({ email: true, app: true, whatsapp: false }); // Reset defaults
        setIsReminderOpen(true);
    };

    const handleSendConfirm = async () => {
        if (!reminderTarget) return;
        setIsSending(true);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let successMsg = `Recordatorio enviado a ${reminderTarget.user.name}`;
        const activeChannels = getActiveChannelsText();
        
        if (activeChannels.length > 0) {
            successMsg += ` vía: ${activeChannels}.`;
        } else {
            alert("Por favor seleccione al menos una vía de notificación.");
            setIsSending(false);
            return;
        }

        alert(successMsg);
        setIsSending(false);
        setIsReminderOpen(false);
        setReminderTarget(null);
    };

    const handleOpenBulkReminders = () => {
        if (selectedMemberIds.length === 0) {
            alert("Por favor seleccione al menos un padre de la lista.");
            return;
        }
        setBulkMessage(
            `Estimados padres,\n\nLes recordamos amablemente que el pago correspondiente a "${group.name}" se encuentra pendiente. Agradecemos su pronta atención para evitar recargos.\n\nAtentamente,\nLa Administración.`
        );
        setChannels({ email: true, app: true, whatsapp: false });
        setIsBulkReminderOpen(true);
    };

    const handleConfirmBulkSend = async () => {
        setIsSending(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const activeChannels = getActiveChannelsText();
        if (!activeChannels) {
             alert("Por favor seleccione al menos una vía de notificación.");
             setIsSending(false);
             return;
        }

        alert(`Se han enviado ${selectedMemberIds.length} recordatorios exitosamente vía: ${activeChannels}.`);
        setIsSending(false);
        setIsBulkReminderOpen(false);
        setSelectedMemberIds([]); // Clear selection after send
    };

    const getActiveChannelsText = () => {
        const active = [];
        if (channels.email) active.push('Correo');
        if (channels.app) active.push('App');
        if (channels.whatsapp) active.push('WhatsApp');
        return active.join(', ');
    }

    // --- Report Logic ---

    const handleExportReport = () => {
        const headers = ["Padre/Madre", "Email", "Teléfono", "Estado", "Último Pago"];
        const rows = members.map(m => 
            [
                `"${m.user.name}"`,
                m.user.email,
                m.user.phone || 'N/A',
                m.status === 'Overdue' ? 'Mora' : (m.status === 'Paid' ? 'Pagado' : 'Pendiente'),
                m.lastPaymentDate ? new Date(m.lastPaymentDate).toLocaleDateString() : '-'
            ].join(',')
        );

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `reporte_grupo_${group.name.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Helper to count selectable members
    const pendingCount = members.filter(m => m.status !== 'Paid').length;
    const isAllSelected = pendingCount > 0 && selectedMemberIds.length === pendingCount;

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={`Detalles del Grupo: ${group.name}`}>
                {isLoading ? <p>Cargando...</p> : (
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Próximo Vencimiento</p>
                                <p className="font-bold text-lg">{new Date(group.nextDueDate).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={handleExportReport}>
                                    <ExcelIcon /> <span className="ml-2">Descargar Reporte</span>
                                </Button>
                                <Button 
                                    size="sm" 
                                    onClick={handleOpenBulkReminders}
                                    disabled={selectedMemberIds.length === 0}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    <SendIcon /> 
                                    <span className="ml-2">
                                        {selectedMemberIds.length > 0 
                                            ? `Enviar a ${selectedMemberIds.length} seleccionados` 
                                            : 'Enviar Recordatorios Masivos'}
                                    </span>
                                </Button>
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto border rounded-lg">
                            <table className="min-w-full text-sm divide-y divide-gray-200">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left w-10">
                                            <input 
                                                type="checkbox" 
                                                onChange={handleSelectAll} 
                                                checked={isAllSelected}
                                                disabled={pendingCount === 0}
                                                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Padre/Madre</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
                                        <th className="px-4 py-3 text-right font-semibold text-gray-600">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {members.map((m, idx) => (
                                        <tr key={idx} className={selectedMemberIds.includes(m.user.id) ? 'bg-blue-50' : ''}>
                                            <td className="px-4 py-3 text-center">
                                                {m.status !== 'Paid' && (
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedMemberIds.includes(m.user.id)}
                                                        onChange={() => handleSelectMember(m.user.id)}
                                                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">{m.user.name}</p>
                                                <p className="text-xs text-gray-500">{m.user.email}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge color={m.status === 'Paid' ? 'green' : m.status === 'Overdue' ? 'red' : 'yellow'}>
                                                    {m.status === 'Overdue' ? 'Mora' : m.status === 'Paid' ? 'Pagado' : 'Pendiente'}
                                                </Badge>
                                                {m.lastPaymentDate && <p className="text-[10px] text-gray-400 mt-1">Pagado: {new Date(m.lastPaymentDate).toLocaleDateString()}</p>}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {m.status !== 'Paid' && (
                                                    <Button size="sm" variant="secondary" onClick={() => handleOpenReminder(m)}>
                                                        Recordar
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Single Reminder Modal */}
            {isReminderOpen && reminderTarget && (
                <Modal 
                    isOpen={isReminderOpen} 
                    onClose={() => setIsReminderOpen(false)} 
                    title={`Recordatorio para ${reminderTarget.user.name.split(' ')[0]}`}
                    footer={
                        <div className="space-x-2">
                            <Button variant="secondary" onClick={() => setIsReminderOpen(false)} disabled={isSending}>Cancelar</Button>
                            <Button onClick={handleSendConfirm} disabled={isSending}>
                                {isSending ? 'Enviando...' : 'Enviar Notificación'}
                            </Button>
                        </div>
                    }
                >
                    <ReminderContent 
                        message={reminderMessage} 
                        setMessage={setReminderMessage} 
                        channels={channels} 
                        setChannels={setChannels} 
                    />
                </Modal>
            )}

            {/* Bulk Reminder Modal */}
            {isBulkReminderOpen && (
                <Modal 
                    isOpen={isBulkReminderOpen} 
                    onClose={() => setIsBulkReminderOpen(false)} 
                    title={`Enviar Recordatorios Masivos (${selectedMemberIds.length})`}
                    footer={
                        <div className="space-x-2">
                            <Button variant="secondary" onClick={() => setIsBulkReminderOpen(false)} disabled={isSending}>Cancelar</Button>
                            <Button onClick={handleConfirmBulkSend} disabled={isSending}>
                                {isSending ? 'Enviando...' : 'Enviar a Todos'}
                            </Button>
                        </div>
                    }
                >
                    <ReminderContent 
                        message={bulkMessage} 
                        setMessage={setBulkMessage} 
                        channels={channels} 
                        setChannels={setChannels} 
                        isBulk={true}
                    />
                </Modal>
            )}
        </>
    );
};

// Helper component for modal content reuse
const ReminderContent: React.FC<{
    message: string;
    setMessage: (s: string) => void;
    channels: { email: boolean; app: boolean; whatsapp: boolean };
    setChannels: React.Dispatch<React.SetStateAction<{ email: boolean; app: boolean; whatsapp: boolean }>>;
    isBulk?: boolean;
}> = ({ message, setMessage, channels, setChannels, isBulk }) => (
    <div className="space-y-4">
        {isBulk && (
            <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 border border-yellow-200">
                Se enviará este mensaje a todos los padres seleccionados.
            </div>
        )}
        <div>
            <Label>Mensaje</Label>
            <Textarea 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                rows={6}
            />
        </div>
        <div>
            <Label>Vías de notificación</Label>
            <div className="flex flex-col gap-2 mt-2">
                <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200">
                    <input 
                        type="checkbox" 
                        checked={channels.email} 
                        onChange={e => setChannels(prev => ({...prev, email: e.target.checked}))}
                        className="rounded text-blue-600 h-4 w-4"
                    />
                    <MailIcon />
                    <span>Correo Electrónico</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200">
                    <input 
                        type="checkbox" 
                        checked={channels.app} 
                        onChange={e => setChannels(prev => ({...prev, app: e.target.checked}))}
                        className="rounded text-blue-600 h-4 w-4"
                    />
                    <ChatIcon />
                    <span>Mensaje Interno (App)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200">
                    <input 
                        type="checkbox" 
                        checked={channels.whatsapp} 
                        onChange={e => setChannels(prev => ({...prev, whatsapp: e.target.checked}))}
                        className="rounded text-green-600 h-4 w-4"
                    />
                    <div className="text-green-600"><WhatsAppIcon /></div>
                    <span>WhatsApp</span>
                </label>
            </div>
        </div>
    </div>
);
