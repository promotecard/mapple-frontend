
import React from 'react';
import { Button } from '../../ui/Button';

interface SchoolManagementViewProps {
    onNavigate: (view: string) => void;
    onBackToHome: () => void;
}

const MoneyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ConsumptionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>;
const ReportsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const DocumentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

export const SchoolManagementView: React.FC<SchoolManagementViewProps> = ({ onNavigate, onBackToHome }) => {
    const menuItems = [
        { label: 'Estado de Cuenta y Pagos', description: 'Revisa tus pagos pendientes y el historial de transacciones.', icon: <MoneyIcon />, action: () => onNavigate('payments') },
        { label: 'Asignar Fondos para Consumo', description: 'Recarga el balance de tus hijos para compras en la cafetería.', icon: <ConsumptionIcon />, action: () => onNavigate('addFunds') },
        { label: 'Reportes de Consumo', description: 'Revisa el historial de consumo de tus hijos.', icon: <ReportsIcon />, action: () => onNavigate('reports') },
        { label: 'Solicitudes y Permisos', description: 'Envía solicitudes de permisos y otros documentos.', icon: <DocumentIcon />, action: () => alert('Funcionalidad no implementada'), disabled: true },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Gestión Escolar</h1>
                <Button variant="secondary" onClick={onBackToHome}>&larr; Volver a Inicio</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuItems.map(item => (
                    <button 
                        key={item.label} 
                        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start space-x-6 transition-all duration-200 text-left w-full ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:border-blue-500 cursor-pointer transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500'}`}
                        onClick={!item.disabled ? item.action : undefined}
                        disabled={item.disabled}
                        type="button"
                    >
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full mt-1 flex-shrink-0">
                            {item.icon}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">{item.label}</h2>
                            <p className="text-gray-500 mt-1 text-sm">{item.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
