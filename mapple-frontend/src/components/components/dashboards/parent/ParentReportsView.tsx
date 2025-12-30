
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Select } from '../../ui/Select';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import type { Order, PaymentTransaction, Student } from '../../../types';

interface ParentReportsViewProps {
    onBack: () => void;
}

type UnifiedTransaction = {
    id: string;
    date: string;
    channel: 'Pago Escolar' | 'Consumo POS';
    description: string;
    unitPrice?: number;
    quantity?: number;
    tax: number;
    total: number;
};

const GeneralStatementTab: React.FC<{ transactions: PaymentTransaction[], orders: Order[] }> = ({ transactions, orders }) => {
    
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const unifiedTransactions = useMemo(() => {
        const mappedTransactions: UnifiedTransaction[] = transactions.map(t => ({
            id: t.id,
            date: t.date,
            channel: 'Pago Escolar',
            description: t.concept,
            tax: 0,
            total: t.amount,
        }));

        const mappedOrders: UnifiedTransaction[] = orders.flatMap(order => {
            const description = order.items.map(item => `${item.quantity}x ${item.productName}`).join(', ');
            return {
                id: order.id,
                date: order.orderDate,
                channel: 'Consumo POS',
                description: description,
                tax: order.taxAmount,
                total: order.finalAmount,
            };
        });

        const allTransactions = [...mappedTransactions, ...mappedOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return allTransactions.filter(t => {
            const transactionDate = t.date.split('T')[0];
            const matchesSearch = searchTerm === '' || t.description.toLowerCase().includes(searchTerm.toLowerCase());
            const afterStartDate = !startDate || transactionDate >= startDate;
            const beforeEndDate = !endDate || transactionDate <= endDate;
            return matchesSearch && afterStartDate && beforeEndDate;
        });

    }, [transactions, orders, searchTerm, startDate, endDate]);

    return (
        <Card>
            <CardHeader><h3 className="font-semibold">Estado de Cuenta General</h3></CardHeader>
            <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border rounded-lg bg-gray-50 mb-6">
                    <div className="md:col-span-2">
                        <Label htmlFor="search-description">Buscar por Descripción</Label>
                        <Input 
                            id="search-description"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Ej: Mensualidad, Sandwich..."
                        />
                    </div>
                    <div>
                        <Label htmlFor="start-date-statement">Desde</Label>
                        <Input 
                            type="date" 
                            id="start-date-statement"
                            value={startDate} 
                            onChange={e => setStartDate(e.target.value)} 
                        />
                    </div>
                    <div>
                        <Label htmlFor="end-date-statement">Hasta</Label>
                        <Input 
                            type="date" 
                            id="end-date-statement"
                            value={endDate} 
                            onChange={e => setEndDate(e.target.value)} 
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {['ID Transacción', 'Fecha', 'Canal', 'Descripción', 'Impuestos', 'Total'].map(header => (
                                    <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {unifiedTransactions.map(t => (
                                <tr key={t.id}>
                                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{t.id.split('-')[1]}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{t.channel}</td>
                                    <td className="px-4 py-3 font-medium">{t.description}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">${t.tax.toFixed(2)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap font-semibold">${t.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

const ConsumptionReportTab: React.FC<{ orders: Order[], students: Student[] }> = ({ orders, students }) => {
    const today = new Date().toISOString().split('T')[0];
    const [studentFilter, setStudentFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState(today);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const orderDate = order.orderDate.split('T')[0];
            const matchesStudent = studentFilter === 'all' || order.studentId === studentFilter;
            const matchesDate = (!startDate || orderDate >= startDate) && (!endDate || orderDate <= endDate);
            
            // Search within the items of the order
            const matchesSearch = searchTerm === '' || order.items.some(item => 
                item.productName.toLowerCase().includes(searchTerm.toLowerCase())
            );

            return matchesStudent && matchesDate && matchesSearch;
        }).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    }, [orders, studentFilter, startDate, endDate, searchTerm]);

    const totalConsumed = filteredOrders.reduce((sum, order) => sum + order.finalAmount, 0);

    const handleExportCSV = () => {
        if (filteredOrders.length === 0) return;
        const headers = ["Fecha", "Hora", "Hijo/a", "Detalle", "Total"];
        const rows = filteredOrders.map(order => 
            [
                new Date(order.orderDate).toLocaleDateString(),
                new Date(order.orderDate).toLocaleTimeString(),
                `"${students.find(s => s.id === order.studentId)?.name || 'N/A'}"`,
                `"${order.items.map(i => `(${i.quantity}) ${i.productName}`).join(', ')}"`,
                order.finalAmount.toFixed(2)
            ].join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `historial_consumo_${startDate}_a_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Historial de Consumo en Cafetería</h3>
                    <Button variant="secondary" onClick={handleExportCSV} disabled={filteredOrders.length === 0}>Exportar Historial</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border rounded-lg bg-gray-50 mb-6">
                    <div className="md:col-span-2">
                        <Label htmlFor="search-product">Buscar Producto</Label>
                        <Input 
                            id="search-product"
                            placeholder="Ej: Pizza, Jugo..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="student-filter">Filtrar por Hijo/a</Label>
                        <Select id="student-filter" value={studentFilter} onChange={e => setStudentFilter(e.target.value)}>
                            <option value="all">Todos mis hijos</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="start-date">Desde</Label>
                        <Input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="end-date">Hasta</Label>
                        <Input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg mb-4 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-600 font-medium">Total Consumido en Periodo</p>
                        <p className="text-xs text-gray-500">Basado en los filtros seleccionados</p>
                    </div>
                    <p className="text-3xl font-bold text-blue-800">${totalConsumed.toFixed(2)}</p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                             <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha / Hora</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hijo/a</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/2">Detalle de Consumo</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                             {filteredOrders.length > 0 ? filteredOrders.map(order => (
                                 <tr key={order.id}>
                                     <td className="px-4 py-3">
                                         <div className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</div>
                                         <div className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                     </td>
                                     <td className="px-4 py-3 font-medium text-gray-700">
                                         {students.find(s => s.id === order.studentId)?.name || 'N/A'}
                                     </td>
                                     <td className="px-4 py-3">
                                         {order.items.map((i, idx) => (
                                             <span key={idx} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-2 mb-1">
                                                 {i.quantity}x {i.productName}
                                             </span>
                                         ))}
                                     </td>
                                     <td className="px-4 py-3 font-bold text-right">${order.finalAmount.toFixed(2)}</td>
                                 </tr>
                             )) : (
                                 <tr>
                                     <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                         No se encontraron consumos con los criterios de búsqueda.
                                     </td>
                                 </tr>
                             )}
                         </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export const ParentReportsView: React.FC<ParentReportsViewProps> = ({ onBack }) => {
    const { currentUser } = useAppContext();
    const [activeTab, setActiveTab] = useState('consumption');
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    const fetchData = useCallback(async () => {
        if (!currentUser?.schoolId || !currentUser.id) return;
        setIsLoading(true);
        try {
            const [allTransactions, allOrders, myStudents] = await Promise.all([
                api.getPaymentTransactionsBySchool(currentUser.schoolId),
                // In a real app, fetch only relevant orders. Here we filter later for simplicity in mock.
                api.getOrdersByProvider('provider-1'), 
                api.getStudentsByParent(currentUser.id)
            ]);
    
            const myStudentIds = myStudents.map(s => s.id);
            setStudents(myStudents);
            setTransactions(allTransactions.filter(t => t.parentId === currentUser.id));
            
            // Filter orders belonging to the parent's students
            const myOrders = allOrders.filter(o => o.studentId && myStudentIds.includes(o.studentId));
            setOrders(myOrders);
    
        } catch (error) {
            console.error("Failed to fetch report data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Reportes Financieros</h1>
                <Button variant="secondary" onClick={onBack}>&larr; Volver a Gestión Escolar</Button>
            </div>
             <div className="flex border-b border-gray-200">
                <button onClick={() => setActiveTab('consumption')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'consumption' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Historial de Consumo</button>
                <button onClick={() => setActiveTab('statement')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'statement' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Estado de Cuenta General</button>
            </div>
            {isLoading ? <p>Cargando reportes...</p> : (
                <>
                    {activeTab === 'statement' && <GeneralStatementTab transactions={transactions} orders={orders} />}
                    {activeTab === 'consumption' && <ConsumptionReportTab orders={orders} students={students} />}
                </>
            )}
        </div>
    );
};
