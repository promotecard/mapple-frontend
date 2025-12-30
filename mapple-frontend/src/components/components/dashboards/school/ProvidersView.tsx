
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import type { Provider } from '../../../types';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Badge } from '../../ui/Badge';

interface ProvidersViewProps {}

export const ProvidersView: React.FC<ProvidersViewProps> = () => {
    const { currentUser } = useAppContext();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (currentUser?.schoolId) {
            setIsLoading(true);
            // Only fetch providers, users data is no longer needed since impersonation is removed
            const providersData = await api.getProvidersBySchool(currentUser.schoolId);
            setProviders(providersData);
            setIsLoading(false);
        }
    }, [currentUser?.schoolId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading) {
        return <p>Cargando proveedores vinculados...</p>;
    }

    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-semibold text-gray-800">Proveedores Vinculados</h2>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Negocio</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Venta</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {providers.map((provider) => (
                                <tr key={provider.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{provider.businessName}</div>
                                        <div className="text-xs text-gray-500">{provider.city}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{provider.contactName}</div>
                                        <div className="text-sm text-gray-500">{provider.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge color="blue">{provider.salesType}</Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge color={provider.status === 'Active' ? 'green' : 'gray'}>{provider.status}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {providers.length === 0 && (
                    <p className="text-center py-8 text-gray-500">No hay proveedores vinculados a este colegio.</p>
                )}
            </CardContent>
        </Card>
    );
};
