
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import { PaymentStatus, PaymentTransaction, PaymentMethod, Student } from '../../../types';
import { PaymentModal } from '../../forms/PaymentModal';
import { ReportPaymentModal } from '../../forms/ReportPaymentModal';

// Icons
const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ExclamationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const paymentStatusColorMap: { [key in PaymentStatus]?: 'green' | 'yellow' | 'blue' | 'red' | 'gray' } = {
    [PaymentStatus.Paid]: 'green',
    [PaymentStatus.Confirmed]: 'green',
    [PaymentStatus.Pending]: 'yellow',
    [PaymentStatus.ProofUploaded]: 'blue',
    [PaymentStatus.Rejected]: 'red',
    [PaymentStatus.Overdue]: 'red',
};

export const ParentPaymentsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { currentUser } = useAppContext();
    const [activeTab, setActiveTab] = useState<'pending' | 'processing' | 'history'>('pending');
    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [students, setStudents] = useState<Map<string, Student>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modals
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);

    const fetchData = useCallback(async () => {
        if (currentUser) {
            setIsLoading(true);
            try {
                // Fetch students first
                const myStudents = await api.getStudentsByParent(currentUser.id);
                setStudents(new Map(myStudents.map(s => [s.id, s])));

                // Fetch transactions if schoolId exists
                if (currentUser.schoolId) {
                    const allTransactions = await api.getPaymentTransactionsBySchool(currentUser.schoolId);
                    const myTransactions = allTransactions.filter(t => t.parentId === currentUser.id);
                    setTransactions(myTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                }
            } catch (error) {
                console.error("Error fetching payment data:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [currentUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePayCard = (t: PaymentTransaction) => {
        setSelectedTransaction(t);
        setIsPaymentModalOpen(true);
    };

    const handleReportPayment = (t: PaymentTransaction) => {
        setSelectedTransaction(t);
        setIsReportModalOpen(true);
    }

    const handlePaymentSuccess = async () => {
        if (selectedTransaction) {
            await api.updatePaymentTransactionStatus(selectedTransaction.id, PaymentStatus.Paid);
            setIsPaymentModalOpen(false);
            setSelectedTransaction(null);
            fetchData();
            alert("Pago realizado exitosamente con tarjeta.");
        }
    };

    const handleReportSuccess = () => {
        fetchData();
        setIsReportModalOpen(false);
        setSelectedTransaction(null);
        alert("Comprobante subido correctamente. El colegio verificará el pago pronto.");
    }

    // Filter Logic
    const pendingTransactions = transactions.filter(t => 
        t.status === PaymentStatus.Pending || 
        t.status === PaymentStatus.Rejected || 
        t.status === PaymentStatus.Overdue
    );

    const processingTransactions = transactions.filter(t => 
        t.status === PaymentStatus.ProofUploaded
    );

    const historyTransactions = transactions.filter(t => 
        t.status === PaymentStatus.Paid || 
        t.status === PaymentStatus.Confirmed
    ).filter(t => {
        const matchSearch = t.concept.toLowerCase().includes(searchTerm.toLowerCase());
        const tDate = t.date.split('T')[0];
        const matchStart = !startDate || tDate >= startDate;
        const matchEnd = !endDate || tDate <= endDate;
        return matchSearch && matchStart && matchEnd;
    });

    // Summaries
    const totalDebt = pendingTransactions.reduce((acc, t) => acc + t.amount, 0);
    const totalOverdue = pendingTransactions.filter(t => t.status === PaymentStatus.Overdue).reduce((acc, t) => acc + t.amount, 0);
    
    const getConceptIcon = (concept: string) => {
        const lower = concept.toLowerCase();
        if (lower.includes('mensualidad') || lower.includes('septiembre') || lower.includes('octubre')) return <CalendarIcon />;
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>; 
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-bold text-gray-800">Estado de Cuenta</h1>
                 <Button variant="secondary" onClick={onBack}>&larr; Volver</Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white border-l-4 border-blue-500">
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total a Pagar</p>
                        <p className="text-3xl font-extrabold text-gray-900 mt-1">${totalDebt.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card className={`bg-white border-l-4 ${totalOverdue > 0 ? 'border-red-500 bg-red-50' : 'border-green-500'}`}>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className={`text-sm font-medium uppercase tracking-wider ${totalOverdue > 0 ? 'text-red-600' : 'text-gray-500'}`}>Deuda Vencida (Mora)</p>
                                <p className={`text-3xl font-extrabold mt-1 ${totalOverdue > 0 ? 'text-red-700' : 'text-gray-900'}`}>${totalOverdue.toFixed(2)}</p>
                            </div>
                            {totalOverdue > 0 && <ExclamationIcon />}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-l-4 border-gray-300">
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">En Revisión</p>
                        <p className="text-3xl font-extrabold text-gray-900 mt-1">
                            ${processingTransactions.reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Pagos reportados</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none whitespace-nowrap ${
                        activeTab === 'pending' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    Por Pagar <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{pendingTransactions.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('processing')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none whitespace-nowrap ${
                        activeTab === 'processing' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    En Revisión <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{processingTransactions.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none whitespace-nowrap ${
                        activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    Historial Pagados
                </button>
            </div>

            {isLoading ? <p className="text-center py-8">Cargando información...</p> : (
                <>
                    {/* PENDING TRANSACTIONS */}
                    {activeTab === 'pending' && (
                        <div className="space-y-4">
                            {pendingTransactions.length > 0 ? pendingTransactions.map(t => (
                                <Card key={t.id} className={`overflow-hidden border-l-4 ${t.status === PaymentStatus.Overdue ? 'border-l-red-500 shadow-md' : 'border-l-yellow-400'}`}>
                                    <CardContent className="p-0">
                                        <div className="p-5 flex flex-col md:flex-row justify-between items-center gap-4">
                                            <div className="flex-grow space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                        {getConceptIcon(t.concept)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900">{t.concept}</h3>
                                                        <p className="text-sm text-gray-500">
                                                            Estudiante: <span className="font-medium text-gray-700">{students.get(t.studentId)?.name || 'N/A'}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 mt-2 pl-12">
                                                    <Badge color={paymentStatusColorMap[t.status]}>{t.status === PaymentStatus.Overdue ? 'Mora / Vencido' : 'Pendiente'}</Badge>
                                                    <span className="text-xs text-gray-500">Fecha Límite: {new Date(t.date).toLocaleDateString()}</span>
                                                </div>
                                                {t.status === PaymentStatus.Rejected && (
                                                    <div className="pl-12 mt-1">
                                                        <p className="text-xs text-red-600 font-semibold bg-red-50 p-1 rounded inline-block">
                                                            ⚠️ Su último comprobante fue rechazado. Por favor intente nuevamente.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="text-right min-w-[180px] flex flex-col items-end gap-3">
                                                <p className="text-2xl font-bold text-gray-800">${t.amount.toFixed(2)} <span className="text-sm font-normal text-gray-500">{t.currency}</span></p>
                                                <div className="flex gap-2 w-full">
                                                    <Button size="sm" variant="secondary" onClick={() => handleReportPayment(t)} className="flex-1 text-xs">
                                                        <UploadIcon /> <span className="ml-1">Reportar Pago</span>
                                                    </Button>
                                                    <Button size="sm" onClick={() => handlePayCard(t)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs">
                                                        <CreditCardIcon /> <span className="ml-1">Pagar Tarjeta</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )) : (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                    <div className="mx-auto h-12 w-12 text-green-500 mb-3">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">¡Estás al día!</h3>
                                    <p className="mt-1 text-gray-500">No tienes pagos pendientes en este momento.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PROCESSING TRANSACTIONS */}
                    {activeTab === 'processing' && (
                        <div className="space-y-4">
                            {processingTransactions.length > 0 ? processingTransactions.map(t => (
                                <Card key={t.id} className="bg-gray-50 border border-gray-200 opacity-90">
                                    <CardContent className="p-5 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-gray-200 rounded-full">
                                                <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-700">{t.concept}</h3>
                                                <p className="text-sm text-gray-500">{new Date(t.date).toLocaleDateString()} • {students.get(t.studentId)?.name}</p>
                                                <Badge color="blue" className="mt-1">Comprobante en Revisión</Badge>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-gray-600">${t.amount.toFixed(2)}</p>
                                            <Button size="sm" variant="secondary" disabled className="mt-2 text-xs">Esperando Confirmación</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )) : (
                                <p className="text-center text-gray-500 py-8">No hay pagos en proceso de revisión.</p>
                            )}
                        </div>
                    )}

                    {/* HISTORY TRANSACTIONS */}
                    {activeTab === 'history' && (
                        <Card>
                            <CardHeader>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input placeholder="Buscar por concepto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                    <div className="flex gap-2">
                                        <div className="flex-grow">
                                            <Label className="text-xs mb-1 block">Desde</Label>
                                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                        </div>
                                        <div className="flex-grow">
                                            <Label className="text-xs mb-1 block">Hasta</Label>
                                            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="flex items-end">
                                        <Button variant="secondary" className="w-full" onClick={() => alert("Funcionalidad simulada: Descargando PDF...")}>
                                            <DownloadIcon /> <span className="ml-2">Estado de Cuenta PDF</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Pago</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {historyTransactions.length > 0 ? historyTransactions.map(t => (
                                                <tr key={t.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(t.date).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">{t.concept}</td>
                                                    <td className="px-6 py-4 text-gray-500">{students.get(t.studentId)?.name || '-'}</td>
                                                    <td className="px-6 py-4 text-gray-500">{t.method}</td>
                                                    <td className="px-6 py-4 font-semibold text-gray-800">${t.amount.toFixed(2)}</td>
                                                    <td className="px-6 py-4"><Badge color="green">Pagado</Badge></td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No se encontraron transacciones en el historial.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Modals */}
            {selectedTransaction && (
                <>
                    <PaymentModal 
                        isOpen={isPaymentModalOpen} 
                        onClose={() => setIsPaymentModalOpen(false)} 
                        amount={selectedTransaction.amount} 
                        onPaymentSuccess={handlePaymentSuccess} 
                    />
                    <ReportPaymentModal
                        isOpen={isReportModalOpen}
                        onClose={() => setIsReportModalOpen(false)}
                        onSuccess={handleReportSuccess}
                        transaction={selectedTransaction}
                    />
                </>
            )}
        </div>
    );
};
