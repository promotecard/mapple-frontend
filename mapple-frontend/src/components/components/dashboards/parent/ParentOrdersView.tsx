
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import { PaymentStatus, PaymentTransaction, Order, PaymentMethod } from '../../../types';

const orderStatusColorMap: { [key in Order['status']]: 'yellow' | 'blue' | 'purple' | 'green' | 'red' } = {
    'Pending': 'yellow',
    'Preparing': 'blue',
    'Ready for Delivery': 'purple',
    'Delivered': 'green',
    'Cancelled': 'red',
};

const paymentStatusColorMap: { [key in PaymentStatus]?: 'green' | 'yellow' | 'blue' | 'red' } = {
    [PaymentStatus.Paid]: 'green',
    [PaymentStatus.Confirmed]: 'green',
    [PaymentStatus.Pending]: 'yellow',
    [PaymentStatus.ProofUploaded]: 'blue',
    [PaymentStatus.Rejected]: 'red',
};

export const ParentOrdersView: React.FC = () => {
    const { currentUser } = useAppContext();
    const [orders, setOrders] = useState<Order[]>([]);
    const [transactions, setTransactions] = useState<Map<string, PaymentTransaction>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchData = useCallback(async () => {
        if (currentUser?.id && currentUser.schoolId) {
            setIsLoading(true);
            const [ordersData, allTransactions] = await Promise.all([
                api.getOrdersByParent(currentUser.id),
                api.getPaymentTransactionsBySchool(currentUser.schoolId)
            ]);

            setOrders(ordersData.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
            
            const parentTransactions = allTransactions.filter(t => t.parentId === currentUser.id);
            setTransactions(new Map(parentTransactions.map(t => [t.referenceId, t])));
            
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUploadClick = (orderId: string) => {
        setUploadingOrderId(orderId);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Clear previous selection
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0] && uploadingOrderId) {
            const file = event.target.files[0];

            // Validate size (1MB = 1048576 bytes)
            if (file.size > 1024 * 1024) {
                alert("El archivo es demasiado grande. El tamaño máximo permitido es 1MB.");
                if (fileInputRef.current) fileInputRef.current.value = '';
                setUploadingOrderId(null);
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                try {
                    // Typically orders are paid via Transfer if uploading proof
                    await api.uploadPaymentProof(uploadingOrderId, base64String, PaymentMethod.BankTransfer);
                    alert('Comprobante subido con éxito. El proveedor confirmará el pago pronto.');
                    fetchData();
                } catch (error) {
                    alert('Error al subir el comprobante.');
                } finally {
                    setUploadingOrderId(null);
                }
            };
        } else {
            setUploadingOrderId(null);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Mis Pedidos</h1>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
            {isLoading ? (
                <p>Cargando pedidos...</p>
            ) : orders.length === 0 ? (
                <p>No has realizado ningún pedido todavía.</p>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => {
                        const transaction = transactions.get(order.id);
                        const canUploadProof = order.paymentMethod === PaymentMethod.BankTransfer && transaction?.status === PaymentStatus.Pending;
                        
                        return (
                            <Card key={order.id}>
                                <CardHeader className="flex justify-between items-start bg-gray-50">
                                    <div>
                                        <p className="font-semibold">Pedido #{order.id.substring(6, 12)}</p>
                                        <p className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge color={orderStatusColorMap[order.status]}>{order.status}</Badge>
                                        {transaction && <Badge color={paymentStatusColorMap[transaction.status] || 'gray'} className="ml-2">{transaction.status}</Badge>}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <ul className="text-sm space-y-1 mb-2">
                                        {order.items.map(item => (
                                            <li key={item.productId} className="flex justify-between">
                                                <span>{item.quantity}x {item.productName}</span>
                                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="border-t pt-2 flex justify-between items-center">
                                        <p className="font-bold">Total: ${order.finalAmount.toFixed(2)}</p>
                                        {canUploadProof && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleUploadClick(order.id)}
                                                disabled={uploadingOrderId === order.id}
                                            >
                                                {uploadingOrderId === order.id ? 'Subiendo...' : 'Subir Comprobante (Máx 1MB)'}
                                            </Button>
                                        )}
                                        {transaction?.status === PaymentStatus.Rejected && (
                                            <div className="text-right">
                                                <p className="text-xs text-red-500">Pago rechazado. Por favor, suba un nuevo comprobante.</p>
                                                <Button size="sm" variant="secondary" onClick={() => handleUploadClick(order.id)}>Reintentar</Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
