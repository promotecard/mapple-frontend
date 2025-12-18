import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import type { Order, School } from '../../../types';
import { PaymentMethod } from '../../../types';
import { Modal } from '../../ui/Modal';


const SalesReportTab: React.FC = () => {
    const { currentUser } = useAppContext();
    const [reportData, setReportData] = useState<Order[] | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    const handleGenerateReport = async () => {
        if (!currentUser?.providerId) return;
        setIsGenerating(true);
        const allOrders = await api.getOrdersByProvider(currentUser.providerId);
        const filtered = allOrders.filter(order => {
            const orderDate = order.orderDate.split('T')[0];
            return orderDate >= startDate && orderDate <= endDate && order.status === 'Delivered';
        });
        setReportData(filtered);
        setIsGenerating(false);
    };
    
    const summary = useMemo(() => {
        if (!reportData) return null;
        const totalSales = reportData.reduce((acc, order) => acc + order.finalAmount, 0);
        const productSales = new Map<string, { quantity: number, total: number }>();
        reportData.forEach(order => {
            order.items.forEach(item => {
                const existing = productSales.get(item.productName) || { quantity: 0, total: 0 };
                productSales.set(item.productName, {
                    quantity: existing.quantity + item.quantity,
                    total: existing.total + (item.quantity * item.price)
                });
            });
        });
        return {
            totalSales,
            totalOrders: reportData.length,
            productSales: Array.from(productSales.entries()).sort((a,b) => b[1].quantity - a[1].quantity)
        };
    }, [reportData]);
    
    const handleExportCSV = () => {
        if (!summary) return;
        const headers = ["Producto", "Cantidad Vendida", "Total Ventas"];
        const rows = summary.productSales.map(([name, data]) => 
            [`"${name}"`, data.quantity, data.total.toFixed(2)].join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `reporte_ventas_${startDate}_a_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card>
            <CardHeader><h2 className="text-xl font-semibold">Reporte de Ventas por Producto</h2></CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border rounded-lg bg-gray-50 mb-6">
                    <div><Label htmlFor="start-date">Fecha de Inicio</Label><Input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                    <div><Label htmlFor="end-date">Fecha de Fin</Label><Input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
                    <Button onClick={handleGenerateReport} disabled={isGenerating}>{isGenerating ? 'Generando...' : 'Generar Reporte'}</Button>
                </div>

                {summary ? (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Resumen del Periodo</h3>
                            <Button variant="secondary" onClick={handleExportCSV}>Exportar a Excel</Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                            <div className="p-4 bg-blue-50 rounded-lg"><p className="text-sm text-gray-600">Ventas Totales</p><p className="text-2xl font-bold">${summary.totalSales.toFixed(2)}</p></div>
                            <div className="p-4 bg-blue-50 rounded-lg"><p className="text-sm text-gray-600">Pedidos Completados</p><p className="text-2xl font-bold">{summary.totalOrders}</p></div>
                        </div>
                        <h4 className="font-semibold mb-2">Ventas por Producto</h4>
                        <div className="overflow-x-auto border rounded-lg">
                             <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad Vendida</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Venta</th>
                                    </tr>
                                </thead>
                                 <tbody className="bg-white divide-y divide-gray-200">
                                    {summary.productSales.map(([name, data]) => (
                                        <tr key={name}>
                                            <td className="px-6 py-4 font-medium">{name}</td>
                                            <td className="px-6 py-4">{data.quantity}</td>
                                            <td className="px-6 py-4">${data.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                 </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">Seleccione un rango de fechas para generar un reporte.</p>
                )}
            </CardContent>
        </Card>
    );
};


interface SchoolConsumptionData {
    schoolId: string;
    schoolName: string;
    totalDebt: number;
    orderCount: number;
    orders: Order[];
}

const SchoolConsumptionReport: React.FC = () => {
    const { currentUser } = useAppContext();
    const [consumptionData, setConsumptionData] = useState<SchoolConsumptionData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedSchool, setSelectedSchool] = useState<SchoolConsumptionData | null>(null);

    const fetchData = useCallback(async () => {
        if (!currentUser?.providerId) return;
        setIsLoading(true);

        const [schools, orders] = await Promise.all([
            api.getSchoolsByProvider(currentUser.providerId),
            api.getOrdersByProvider(currentUser.providerId)
        ]);

        const creditOrders = orders.filter(o => o.paymentMethod === PaymentMethod.CorporateCredit);
        
        const dataBySchool = new Map<string, SchoolConsumptionData>();

        schools.forEach(school => {
            dataBySchool.set(school.id, {
                schoolId: school.id,
                schoolName: school.name,
                totalDebt: 0,
                orderCount: 0,
                orders: []
            });
        });

        creditOrders.forEach(order => {
            if (order.schoolId && dataBySchool.has(order.schoolId)) {
                const schoolData = dataBySchool.get(order.schoolId)!;
                schoolData.totalDebt += order.finalAmount;
                schoolData.orderCount += 1;
                schoolData.orders.push(order);
            }
        });
        
        setConsumptionData(Array.from(dataBySchool.values()));
        setIsLoading(false);
    }, [currentUser?.providerId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleViewDetails = (data: SchoolConsumptionData) => {
        setSelectedSchool(data);
        setDetailsModalOpen(true);
    };

    const handleExport = () => {
        const headers = ["Colegio", "Total Adeudado", "Cantidad de Transacciones"];
        const rows = consumptionData.map(d => 
            [d.schoolName, d.totalDebt.toFixed(2), d.orderCount].join(',')
        );
        const csv = [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `reporte_consumo_por_colegio.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) return <p>Cargando datos de consumo...</p>;

    return (
        <>
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Consumo por Colegio (Crédito Corporativo)</h2>
                    <Button variant="secondary" onClick={handleExport} disabled={consumptionData.length === 0}>Exportar Resumen</Button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Colegio</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"># Transacciones</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Adeudado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {consumptionData.map(data => (
                                    <tr key={data.schoolId}>
                                        <td className="px-6 py-4 font-medium">{data.schoolName}</td>
                                        <td className="px-6 py-4">{data.orderCount}</td>
                                        <td className="px-6 py-4 font-semibold">${data.totalDebt.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="secondary" size="sm" onClick={() => handleViewDetails(data)}>Ver Detalles</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {selectedSchool && (
                <Modal isOpen={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} title={`Detalle de Consumo - ${selectedSchool.schoolName}`}>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Fecha</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Comprador</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {selectedSchool.orders.map(order => (
                                    <tr key={order.id}>
                                        <td className="px-4 py-2">{new Date(order.orderDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-2">{order.customerName}</td>
                                        <td className="px-4 py-2">${order.finalAmount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Modal>
            )}
        </>
    );
};


export const ReportsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState('sales');

    return (
        <div className="space-y-4">
            <div className="flex border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('sales')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'sales' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Reporte de Ventas
                </button>
                <button 
                    onClick={() => setActiveTab('consumption')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'consumption' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Consumo por Colegio
                </button>
            </div>
            
            {activeTab === 'sales' && <SalesReportTab />}
            {activeTab === 'consumption' && <SchoolConsumptionReport />}
        </div>
    );
};