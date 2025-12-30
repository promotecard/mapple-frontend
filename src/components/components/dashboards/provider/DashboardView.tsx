import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import type { Order } from '../../../types';

const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <Card>
        <CardContent className="flex items-center justify-between p-6">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full">{icon}</div>
        </CardContent>
    </Card>
);

const SalesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1v.01M12 18v-1m0-1v.01M7 12a5 5 0 0110 0" /></svg>;
const OrdersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const PendingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export const DashboardView: React.FC = () => {
    const { currentUser } = useAppContext();
    const [orders, setOrders] = useState<Order[]>([]);

    const fetchData = useCallback(async () => {
        if (currentUser?.providerId) {
            const ordersData = await api.getOrdersByProvider(currentUser.providerId);
            setOrders(ordersData);
        }
    }, [currentUser?.providerId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const totalSales = orders.reduce((sum, order) => sum + order.finalAmount, 0);
    const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
    const recentOrders = orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Ventas Totales" value={`$${totalSales.toFixed(2)}`} icon={<SalesIcon />} />
                <MetricCard title="Total de Pedidos" value={orders.length} icon={<OrdersIcon />} />
                <MetricCard title="Pedidos Pendientes" value={pendingOrders} icon={<PendingIcon />} />
            </div>
            <Card>
                <CardHeader><h3 className="text-lg font-semibold">Pedidos Recientes</h3></CardHeader>
                <CardContent>
                    <ul className="divide-y divide-gray-200">
                        {recentOrders.map(order => (
                            <li key={order.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{order.customerName}</p>
                                    <p className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">${order.finalAmount.toFixed(2)}</p>
                                    <Badge>{order.status}</Badge>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};
