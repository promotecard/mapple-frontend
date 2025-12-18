import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Badge } from '../../ui/Badge';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import type { Order, Student, ProviderCatalog, PaymentTransaction } from '../../../types';
import { PaymentMethod, PaymentStatus } from '../../../types';
import { OrderLabelsModal } from '../../forms/OrderLabelsModal';
import { PaymentDetailsModal } from '../../forms/PaymentDetailsModal';

type OrderStatus = 'Pending' | 'Preparing' | 'Ready for Delivery' | 'Delivered' | 'Cancelled';

const statusColorMap: { [key in OrderStatus]: 'yellow' | 'blue' | 'purple' | 'green' | 'red' } = {
    'Pending': 'yellow',
    'Preparing': 'blue',
    'Ready for Delivery': 'purple',
    'Delivered': 'green',
    'Cancelled': 'red',
};

const nextStatusMap: { [key in OrderStatus]?: OrderStatus } = {
    'Pending': 'Preparing',
    'Preparing': 'Ready for Delivery',
    'Ready for Delivery': 'Delivered',
};

export const OrdersView: React.FC = () => {
    const { currentUser } = useAppContext();
    const [orders, setOrders] = useState<Order[]>([]);
    const [students, setStudents] = useState<Map<string, Student>>(new Map());
    const [catalogs, setCatalogs] = useState<ProviderCatalog[]>([]);
    const [transactions, setTransactions] = useState<Map<string, PaymentTransaction>>(new Map());
    const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
    const [ordersForLabels, setOrdersForLabels] = useState<Order[]>([]);

    const fetchData = useCallback(async () => {
        if (currentUser?.providerId) {
            const schools = await api.getSchoolsByProvider(currentUser.providerId);
            const schoolIds = schools.map(s => s.id);

            const [ordersData, catalogsData] = await Promise.all([
                api.getOrdersByProvider(currentUser.providerId),
                api.getProviderCatalogsByProvider(currentUser.providerId),
            ]);

            const studentPromises = schoolIds.map(id => api.getStudentsBySchool(id));
            const transactionPromises = schoolIds.map(id => api.getPaymentTransactionsBySchool(id));
            
            const studentsArrays = await Promise.all(studentPromises);
            const transactionsArrays = await Promise.all(transactionPromises);

            const allStudents = studentsArrays.flat();
            const allTransactions = transactionsArrays.flat();

            setOrders(ordersData.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
            setStudents(new Map(allStudents.map(s => [s.id, s])));
            setCatalogs(catalogsData);
            setTransactions(new Map(allTransactions.map(t => [t.referenceId, t])));
        }
    }, [currentUser?.providerId]);


    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusUpdate = async (order: Order, newStatus: OrderStatus) => {
        await api.updateOrder({ ...order, status: newStatus });
        fetchData();
    };
    
    const handleGenerateLabels = () => {
        const ordersToPrint = orders.filter(o => o.status === 'Ready for Delivery');
        if (ordersToPrint.length > 0) {
            setOrdersForLabels(ordersToPrint);
            setIsLabelModalOpen(true);
        } else {
            alert('No hay pedidos listos para entrega para generar etiquetas.');
        }
    };

    const handleViewProof = (transaction: PaymentTransaction) => {
        setSelectedTransaction(transaction);
    };

    const handleConfirmPayment = async (orderId: string) => {
        if (window.confirm('¿Está seguro de que el pago es correcto y desea confirmar este pedido?')) {
            await api.confirmBankTransferOrder(orderId);
            fetchData();
        }
    };

    const handleRejectPayment = async (orderId: string) => {
        if (window.confirm('¿Está seguro de que desea rechazar este comprobante de pago? El pedido será cancelado.')) {
            await api.rejectBankTransferOrder(orderId);
            fetchData();
        }
    };
    
    const filteredOrders = orders.filter(o => 
        (statusFilter === '' || o.status === statusFilter) &&
        (o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.includes(searchTerm))
    );
    
    // For simplicity, we assume one delivery time for all labels. A real app might group by delivery time.
    const deliveryTimeForLabels = catalogs[0]?.deliveryTime || 'N/A';

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                     <div className="flex items-center gap-4">
                        <Input placeholder="Buscar por cliente u orden..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-64" />
                        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-48">
                            <option value="">Todos los estados</option>
                            {Object.keys(statusColorMap).map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                     </div>
                     <Button onClick={handleGenerateLabels}>Imprimir Etiquetas de Entrega</Button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map(order => {
                                    const transaction = transactions.get(order.id);
                                    const showTransferActions = order.paymentMethod === PaymentMethod.BankTransfer && transaction?.status === PaymentStatus.ProofUploaded;

                                    return (
                                        <tr key={order.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{order.id.split('-')[1]}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm"><p className="font-medium text-gray-900">{order.customerName}</p><p className="text-gray-500">{students.get(order.studentId)?.gradeLevel || 'N/A'}</p></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">${order.finalAmount.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><Badge color={(statusColorMap as any)[order.status]}>{order.status}</Badge></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                {showTransferActions && transaction ? (
                                                    <>
                                                        <Button size="sm" variant="secondary" onClick={() => handleViewProof(transaction)}>Ver Comprobante</Button>
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleConfirmPayment(order.id)}>
                                                            Confirmar
                                                        </Button>
                                                        <Button size="sm" variant="danger" onClick={() => handleRejectPayment(order.id)}>
                                                            Rechazar
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        {nextStatusMap[order.status] && (
                                                            <Button size="sm" onClick={() => handleStatusUpdate(order, nextStatusMap[order.status]!)}>
                                                                &rarr; {nextStatusMap[order.status]}
                                                            </Button>
                                                        )}
                                                        {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                                                            <Button size="sm" variant="danger" onClick={() => handleStatusUpdate(order, 'Cancelled')}>
                                                                Cancelar
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            {isLabelModalOpen && (
                <OrderLabelsModal 
                    isOpen={isLabelModalOpen}
                    onClose={() => setIsLabelModalOpen(false)}
                    orders={ordersForLabels}
                    students={students}
                    deliveryTime={deliveryTimeForLabels}
                />
            )}
            {selectedTransaction && (
                <PaymentDetailsModal
                    isOpen={!!selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                    transaction={selectedTransaction}
                />
            )}
        </>
    );
};