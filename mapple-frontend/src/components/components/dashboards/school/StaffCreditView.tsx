import React, { useState, useCallback, useEffect } from 'react';
import type { User, Order, Benefit } from '../../../types';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { BenefitModal } from '../../forms/BenefitModal';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';

interface StaffCreditViewProps {
    staff: User[];
    onUpdate: () => void;
}

const BenefitsTab: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const { currentUser } = useAppContext();
    const [benefits, setBenefits] = useState<Benefit[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);

    const fetchBenefits = useCallback(async () => {
        if (currentUser?.schoolId) {
            const data = await api.getBenefitsBySchool(currentUser.schoolId);
            setBenefits(data);
        }
    }, [currentUser?.schoolId]);

    useEffect(() => {
        fetchBenefits();
    }, [fetchBenefits]);

    const handleCreate = () => {
        setSelectedBenefit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (benefit: Benefit) => {
        setSelectedBenefit(benefit);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        setIsModalOpen(false);
        fetchBenefits();
        onUpdate(); 
    };

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button onClick={handleCreate}>+ Crear Nuevo Beneficio</Button>
            </div>
            <div className="space-y-3">
                {benefits.map(benefit => (
                    <div key={benefit.id} className="p-4 border rounded-lg flex justify-between items-center bg-gray-50">
                        <div>
                            <p className="font-bold text-gray-800">{benefit.name}</p>
                            <p className="text-sm text-gray-600">
                                Subsidio: 
                                {benefit.subsidyPercentage ? ` ${benefit.subsidyPercentage}%` : ''}
                                {benefit.subsidyPercentage && benefit.subsidyAmount ? ' + ' : ''}
                                {benefit.subsidyAmount ? ` $${benefit.subsidyAmount.toFixed(2)}` : ''}
                                {!benefit.subsidyPercentage && !benefit.subsidyAmount && ' Ninguno'}
                            </p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => handleEdit(benefit)}>Editar</Button>
                    </div>
                ))}
                 {benefits.length === 0 && <p className="text-center text-gray-500 py-4">No se han creado beneficios.</p>}
            </div>
            {isModalOpen && (
                <BenefitModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    benefit={selectedBenefit}
                />
            )}
        </>
    );
};

const ConsumptionReportsTab: React.FC<{ staff: User[] }> = ({ staff }) => {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [individualHistory, setIndividualHistory] = useState<Order[]>([]);

    const handleGenerateIndividualReport = async () => {
        if (!selectedStaffId) return;
        const history = await api.getStaffConsumptionHistory(selectedStaffId);
        setIndividualHistory(history);
    };

    const handleExportPayroll = async () => {
        let csvContent = "data:text/csv;charset=utf-8,ID Empleado,Nombre,Total Consumido\n";
        
        for (const user of staff) {
            const history = await api.getStaffConsumptionHistory(user.id);
            const userConsumption = history
                .filter(order => {
                    const orderDate = order.orderDate.split('T')[0];
                    return orderDate >= startDate && orderDate <= endDate;
                })
                .reduce((sum, order) => sum + order.finalAmount, 0);
            
            if (userConsumption > 0) {
                const row = [user.id, `"${user.name}"`, userConsumption.toFixed(2)].join(',');
                csvContent += row + "\n";
            }
        }
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `reporte_nomina_${startDate}_a_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><h3 className="font-semibold">Reporte para Descuento de Nómina</h3></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div><Label htmlFor="start-date">Fecha de Inicio</Label><Input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                        <div><Label htmlFor="end-date">Fecha de Fin</Label><Input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
                        <Button onClick={handleExportPayroll}>Exportar CSV para Nómina</Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><h3 className="font-semibold">Reporte de Consumo Individual</h3></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                            <Label htmlFor="staff-select">Seleccionar Empleado</Label>
                            <select id="staff-select" value={selectedStaffId} onChange={e => setSelectedStaffId(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="">-- Seleccione --</option>
                                {staff.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                            </select>
                        </div>
                        <Button onClick={handleGenerateIndividualReport} disabled={!selectedStaffId}>Ver Historial</Button>
                    </div>
                    {individualHistory.length > 0 && (
                         <div className="mt-4 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500">Fecha</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500">Items</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {individualHistory.map(order => (
                                        <tr key={order.id}>
                                            <td className="px-4 py-2">{new Date(order.orderDate).toLocaleString()}</td>
                                            <td className="px-4 py-2">{order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}</td>
                                            <td className="px-4 py-2 font-semibold">${order.finalAmount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export const StaffCreditView: React.FC<StaffCreditViewProps> = ({ staff, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('benefits');

    return (
        <div className="space-y-4">
             <div className="flex border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('benefits')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'benefits' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Beneficios
                </button>
                <button 
                    onClick={() => setActiveTab('reports')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'reports' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Reportes de Consumo
                </button>
            </div>
            {activeTab === 'benefits' && <BenefitsTab onUpdate={onUpdate} />}
            {activeTab === 'reports' && <ConsumptionReportsTab staff={staff} />}
        </div>
    );
};