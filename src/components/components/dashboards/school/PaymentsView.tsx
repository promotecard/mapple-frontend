
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import { Select } from '../../ui/Select';
import { Label } from '../../ui/Label';
import { PaymentMethod, PaymentStatus, PaymentTransaction, RecurringPayment, School, Student, User, Activity, PaymentGroup } from '../../../types';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import { PaymentDetailsModal } from '../../forms/PaymentDetailsModal';
import { RecurringPaymentModal } from '../../forms/RecurringPaymentModal';
import { CreateChargeModal } from '../../forms/CreateChargeModal';
import { ManualPaymentModal } from '../../forms/ManualPaymentModal';
import { CreatePaymentGroupModal } from '../../forms/CreatePaymentGroupModal';
import { PaymentGroupDetailsModal } from '../../forms/PaymentGroupDetailsModal';

const paymentStatusColorMap: { [key in PaymentStatus]?: 'green' | 'yellow' | 'blue' | 'red' | 'gray' } = {
    [PaymentStatus.Paid]: 'green',
    [PaymentStatus.Confirmed]: 'green',
    [PaymentStatus.Pending]: 'yellow',
    [PaymentStatus.ProofUploaded]: 'blue',
    [PaymentStatus.Rejected]: 'red',
    [PaymentStatus.Overdue]: 'red',
};

const TransactionsTab: React.FC<{
    transactions: PaymentTransaction[],
    students: Map<string, Student>,
    parents: Map<string, User>,
    concepts: Map<string, string>,
    onUpdate: () => void
}> = ({ transactions, students, parents, concepts, onUpdate }) => {
    const [filteredTransactions, setFilteredTransactions] = useState(transactions);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
    const [transactionForPayment, setTransactionForPayment] = useState<PaymentTransaction | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false);
    const [isCreateChargeOpen, setIsCreateChargeOpen] = useState(false);

    useEffect(() => {
        let result = transactions;
        if (statusFilter) {
            result = result.filter(t => t.status === statusFilter);
        }
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            result = result.filter(t => 
                students.get(t.studentId)?.name.toLowerCase().includes(lowercasedTerm) ||
                parents.get(t.parentId)?.name.toLowerCase().includes(lowercasedTerm) ||
                t.concept.toLowerCase().includes(lowercasedTerm)
            );
        }
        setFilteredTransactions(result);
    }, [transactions, statusFilter, searchTerm, students, parents]);

    const handleViewDetails = (transaction: PaymentTransaction) => {
        setSelectedTransaction(transaction);
        setIsDetailsModalOpen(true);
    };

    const handleRegisterPayment = (transaction: PaymentTransaction) => {
        setTransactionForPayment(transaction);
        setIsManualPaymentOpen(true);
    };

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 pb-4 border-b">
                <div className="flex gap-4 flex-grow">
                    <Input placeholder="Buscar por estudiante, padre o concepto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-grow"/>
                    <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="md:w-48">
                        <option value="">Todos los estados</option>
                        {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsCreateChargeOpen(true)}>+ Crear Cargo / Mora</Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTransactions.map(t => (
                            <tr key={t.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="font-medium text-gray-900">{students.get(t.studentId)?.name || 'N/A'}</div>
                                    <div className="text-gray-500">{parents.get(t.parentId)?.name || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{concepts.get(t.referenceId) || t.concept}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">${t.amount.toFixed(2)} {t.currency}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge color={paymentStatusColorMap[t.status]}>{t.status}</Badge></td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    {(t.status === PaymentStatus.Pending || t.status === PaymentStatus.Overdue || t.status === PaymentStatus.Rejected) && (
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleRegisterPayment(t)}>
                                            Registrar Pago
                                        </Button>
                                    )}
                                    {t.proofUrl && (
                                        <Button size="sm" variant="secondary" onClick={() => handleViewDetails(t)}>Ver Comprobante</Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isDetailsModalOpen && selectedTransaction && (
                <PaymentDetailsModal 
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    transaction={selectedTransaction}
                />
            )}
            {isManualPaymentOpen && transactionForPayment && (
                <ManualPaymentModal
                    isOpen={isManualPaymentOpen}
                    onClose={() => setIsManualPaymentOpen(false)}
                    onSave={onUpdate}
                    transaction={transactionForPayment}
                />
            )}
            <CreateChargeModal 
                isOpen={isCreateChargeOpen}
                onClose={() => setIsCreateChargeOpen(false)}
                onSave={onUpdate}
            />
        </>
    );
};

const PendingConfirmationTab: React.FC<{
    transactions: PaymentTransaction[],
    students: Map<string, Student>,
    parents: Map<string, User>,
    concepts: Map<string, string>,
    onUpdate: () => void
}> = ({ transactions, students, parents, concepts, onUpdate }) => {
    const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const pendingTransactions = transactions.filter(t => t.status === PaymentStatus.ProofUploaded || (t.status === PaymentStatus.Pending && (t.method === PaymentMethod.Cash || t.method === PaymentMethod.BankTransfer)));

    const handleViewDetails = (transaction: PaymentTransaction) => {
        setSelectedTransaction(transaction);
        setIsDetailsModalOpen(true);
    };

    const handleUpdateStatus = async (transactionId: string, status: PaymentStatus) => {
        if (!window.confirm(`¿Seguro que deseas ${status === PaymentStatus.Confirmed ? 'confirmar' : 'rechazar'} este pago?`)) return;

        setUpdatingId(transactionId);
        try {
            await api.updatePaymentTransactionStatus(transactionId, status);
            onUpdate();
        } catch (error) {
            alert('Error updating status.');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <>
            <p className="text-sm text-gray-600 mb-4">
                Aquí se listan los pagos que requieren verificación manual, como transferencias bancarias con comprobante.
            </p>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante / Padre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pendingTransactions.length > 0 ? pendingTransactions.map(t => (
                            <tr key={t.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="font-medium text-gray-900">{students.get(t.studentId)?.name || 'N/A'}</div>
                                    <div className="text-gray-500">{parents.get(t.parentId)?.name || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{concepts.get(t.referenceId) || t.concept}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.amount.toFixed(2)} {t.currency}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><Badge color={t.method === PaymentMethod.Cash ? 'yellow' : 'blue'}>{t.method}</Badge></td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    {t.proofUrl && (
                                        <Button size="sm" variant="secondary" onClick={() => handleViewDetails(t)}>Ver Comprobante</Button>
                                    )}
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(t.id, PaymentStatus.Confirmed)} disabled={updatingId === t.id}>Confirmar</Button>
                                    <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(t.id, PaymentStatus.Rejected)} disabled={updatingId === t.id}>Rechazar</Button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">No hay pagos pendientes de confirmación.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isDetailsModalOpen && selectedTransaction && (
                <PaymentDetailsModal 
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    transaction={selectedTransaction}
                />
            )}
        </>
    );
};


const RecurringPaymentsTab: React.FC<{ recurringPayments: RecurringPayment[], onUpdate: () => void }> = ({ recurringPayments, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = () => {
        onUpdate();
        setIsModalOpen(false);
    };
    
    const handleGenerateAll = (rp: RecurringPayment) => {
        if(window.confirm(`¿Desea generar el cargo de "${rp.name}" para TODOS los estudiantes activos?`)) {
            // Simulation of batch generation
            alert(`Se han generado cargos de ${rp.name} para 150 estudiantes.`);
            onUpdate();
        }
    }

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button onClick={() => setIsModalOpen(true)}>+ Crear Concepto Recurrente</Button>
            </div>
            <Card>
                <CardContent>
                    <ul className="divide-y divide-gray-200">
                        {recurringPayments.map(rp => (
                            <li key={rp.id} className="py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex-grow">
                                    <p className="font-bold text-gray-800 text-lg">{rp.name}</p>
                                    <p className="text-sm text-gray-500">Frecuencia: {rp.frequency}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-lg font-semibold text-blue-600">${rp.amount.toFixed(2)} {rp.currency}</p>
                                    <Button variant="secondary" size="sm" className="mt-2" onClick={() => handleGenerateAll(rp)}>
                                        Generar Lote del Mes
                                    </Button>
                                </div>
                            </li>
                        ))}
                        {recurringPayments.length === 0 && <p className="text-center text-gray-500 p-4">No hay pagos recurrentes configurados.</p>}
                    </ul>
                </CardContent>
            </Card>
            {isModalOpen && <RecurringPaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </>
    );
};

// --- NEW: Payment Groups Tab ---
const PaymentGroupsTab: React.FC = () => {
    const { currentUser } = useAppContext();
    const [groups, setGroups] = useState<PaymentGroup[]>([]);
    const [recurringPayments, setRecurringPayments] = useState<Map<string, RecurringPayment>>(new Map());
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<PaymentGroup | null>(null);

    const fetchData = useCallback(async () => {
        if (currentUser?.schoolId) {
            const [groupsData, rpsData] = await Promise.all([
                api.getPaymentGroupsBySchool(currentUser.schoolId),
                api.getRecurringPayments(currentUser.schoolId)
            ]);
            setGroups(groupsData);
            setRecurringPayments(new Map(rpsData.map(rp => [rp.id, rp])));
        }
    }, [currentUser?.schoolId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = () => {
        setIsCreateModalOpen(true);
    };

    const handleViewDetails = (group: PaymentGroup) => {
        setSelectedGroup(group);
        setIsDetailsModalOpen(true);
    };

    const handleSave = () => {
        fetchData();
        setIsCreateModalOpen(false);
    };

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">Cree grupos (por grado o tanda) para asignar cobros recurrentes automáticos.</p>
                <Button onClick={handleCreate}>+ Crear Grupo de Pagos</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map(group => {
                    const rp = recurringPayments.get(group.recurringPaymentId);
                    return (
                        <Card key={group.id}>
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg">{group.name}</h3>
                                        <p className="text-sm text-gray-500 mb-1">Concepto: {rp?.name || 'Desconocido'}</p>
                                        <p className="text-xs text-gray-400">Próximo corte: {new Date(group.nextDueDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono font-semibold text-blue-600">${rp?.amount.toFixed(2)}</p>
                                        <Badge color="blue">{group.memberParentIds.length} miembros</Badge>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t flex justify-end">
                                    <Button size="sm" variant="secondary" onClick={() => handleViewDetails(group)}>Ver Estado y Morosos</Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
                {groups.length === 0 && <p className="text-gray-500 text-center col-span-2 py-8">No hay grupos creados.</p>}
            </div>

            <CreatePaymentGroupModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onSave={handleSave} 
            />
            
            {selectedGroup && (
                <PaymentGroupDetailsModal 
                    isOpen={isDetailsModalOpen} 
                    onClose={() => setIsDetailsModalOpen(false)} 
                    group={selectedGroup} 
                />
            )}
        </>
    );
};


const SettingsTab: React.FC<{ school: School | null, onUpdate: () => void }> = ({ school, onUpdate }) => {
    const [acceptedMethods, setAcceptedMethods] = useState<PaymentMethod[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (school) {
            setAcceptedMethods(school.acceptedPaymentMethods);
        }
    }, [school]);

    const handleMethodChange = (method: PaymentMethod, checked: boolean) => {
        setAcceptedMethods(prev => 
            checked ? [...prev, method] : prev.filter(m => m !== method)
        );
    };

    const handleSave = async () => {
        if (!school) return;
        setIsSaving(true);
        await api.updateSchoolPaymentMethods(school.id, acceptedMethods);
        onUpdate();
        setIsSaving(false);
        alert('Configuración guardada.');
    };

    if (!school) return <p>Cargando configuración...</p>;

    return (
        <Card className="max-w-md">
            <CardHeader><h3 className="text-lg font-semibold">Métodos de Pago Aceptados</h3></CardHeader>
            <CardContent className="space-y-4">
                {Object.values(PaymentMethod).map(method => (
                    <label key={method} className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={acceptedMethods.includes(method)}
                            onChange={(e) => handleMethodChange(method, e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{method.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </label>
                ))}
                <div className="pt-4 border-t">
                    <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</Button>
                </div>
            </CardContent>
        </Card>
    );
};

export const PaymentsView: React.FC = () => {
    const { currentUser } = useAppContext();
    const [activeTab, setActiveTab] = useState('transactions');
    const [isLoading, setIsLoading] = useState(true);

    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
    const [school, setSchool] = useState<School | null>(null);
    const [students, setStudents] = useState<Map<string, Student>>(new Map());
    const [parents, setParents] = useState<Map<string, User>>(new Map());
    const [activities, setActivities] = useState<Map<string, Activity>>(new Map());

    const fetchData = useCallback(async () => {
        if (currentUser?.schoolId) {
            setIsLoading(true);
            const [transData, recData, schoolsData, studentsData, usersData, activitiesData] = await Promise.all([
                api.getPaymentTransactionsBySchool(currentUser.schoolId),
                api.getRecurringPayments(currentUser.schoolId),
                api.getSchools(),
                api.getStudentsBySchool(currentUser.schoolId),
                api.getUsers(),
                api.getActivitiesBySchool(currentUser.schoolId)
            ]);

            setTransactions(transData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setRecurringPayments(recData);
            setSchool(schoolsData.find(s => s.id === currentUser.schoolId) || null);
            setStudents(new Map(studentsData.map(s => [s.id, s])));
            setParents(new Map(usersData.filter(u => u.schoolId === currentUser.schoolId).map(u => [u.id, u])));
            setActivities(new Map(activitiesData.map(a => [a.id, a])));
            setIsLoading(false);
        }
    }, [currentUser?.schoolId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const conceptMap = new Map<string, string>();
    activities.forEach((act, id) => conceptMap.set(id, act.name));
    recurringPayments.forEach(rp => conceptMap.set(rp.id, rp.name));
    transactions.forEach(t => {
        if (!conceptMap.has(t.referenceId)) {
            conceptMap.set(t.referenceId, t.concept)
        }
    });

    const pendingConfirmationCount = transactions.filter(t => t.status === PaymentStatus.ProofUploaded).length;

    return (
        <div className="space-y-4">
            <div className="flex border-b border-gray-200 overflow-x-auto">
                <button onClick={() => setActiveTab('transactions')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'transactions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Transacciones</button>
                <button onClick={() => setActiveTab('confirmation')} className={`flex items-center px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'confirmation' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Confirmación de Pagos
                    {pendingConfirmationCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{pendingConfirmationCount}</span>
                    )}
                </button>
                <button onClick={() => setActiveTab('recurring')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'recurring' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Conceptos Recurrentes</button>
                <button onClick={() => setActiveTab('groups')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'groups' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Grupos de Pagos</button>
                <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'settings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Configuración</button>
            </div>

            {isLoading ? <p>Cargando datos de pagos...</p> : (
                <>
                    {activeTab === 'transactions' && <TransactionsTab transactions={transactions} students={students} parents={parents} concepts={conceptMap} onUpdate={fetchData} />}
                    {activeTab === 'confirmation' && <PendingConfirmationTab transactions={transactions} students={students} parents={parents} concepts={conceptMap} onUpdate={fetchData} />}
                    {activeTab === 'recurring' && <RecurringPaymentsTab recurringPayments={recurringPayments} onUpdate={fetchData} />}
                    {activeTab === 'groups' && <PaymentGroupsTab />}
                    {activeTab === 'settings' && <SettingsTab school={school} onUpdate={fetchData} />}
                </>
            )}
        </div>
    );
};
