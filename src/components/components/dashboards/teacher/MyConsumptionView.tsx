import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import type { Order } from '../../../types';

export const MyConsumptionView: React.FC = () => {
    const { currentUser, login } = useAppContext(); 
    const [history, setHistory] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (currentUser) {
            setIsLoading(true);
            await login(currentUser.id); 
            const historyData = await api.getStaffConsumptionHistory(currentUser.id);
            setHistory(historyData);
            setIsLoading(false);
        }
    }, [currentUser, login]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading || !currentUser) {
        return <p>Cargando tu historial de consumo...</p>;
    }

    const debt = currentUser.corporateDebt || 0;
    const limit = currentUser.creditLimit || 0;
    const available = limit - debt;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-6 text-center">
                        <p className="text-sm font-medium text-red-800">Deuda Actual</p>
                        <p className="text-4xl font-extrabold text-red-700">${debt.toFixed(2)}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-sm font-medium text-gray-500">Límite de Crédito</p>
                        <p className="text-4xl font-extrabold text-gray-700">${limit.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6 text-center">
                        <p className="text-sm font-medium text-green-800">Crédito Disponible</p>
                        <p className="text-4xl font-extrabold text-green-700">${available.toFixed(2)}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><h2 className="text-xl font-semibold">Historial de Compras</h2></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {history.map(order => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(order.orderDate).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            {order.items.map(item => `(${item.quantity}) ${item.productName}`).join(', ')}
                                        </td>
                                        <td className="px-6 py-4 font-semibold">${order.finalAmount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {history.length === 0 && <p className="text-center p-8 text-gray-500">Aún no has realizado compras con tu crédito corporativo.</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};