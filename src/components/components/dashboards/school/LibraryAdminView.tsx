
import React, { useState, useEffect, useCallback } from 'react';
import type { LibraryItem } from '../../../types';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { LibraryResourceModal } from '../../forms/LibraryResourceModal';

export const LibraryAdminView: React.FC = () => {
    const { currentUser } = useAppContext();
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchItems = useCallback(async () => {
        if (currentUser?.schoolId) {
            setIsLoading(true);
            try {
                const data = await api.getLibraryBySchool(currentUser.schoolId);
                setItems(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } finally {
                setIsLoading(false);
            }
        }
    }, [currentUser?.schoolId]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleDelete = async (id: string) => {
        if(window.confirm("¿Está seguro de eliminar este recurso?")) {
            try {
                await api.deleteLibraryItem(id);
                fetchItems();
            } catch (error) {
                alert("Error al eliminar el recurso.");
            }
        }
    }

    const handleSave = () => {
        fetchItems();
        setIsModalOpen(false);
    }

    return (
        <>
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Gestionar Biblioteca</h2>
                    <Button onClick={() => setIsModalOpen(true)}>+ Añadir Recurso</Button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de Creación</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr><td colSpan={4} className="text-center p-4">Cargando...</td></tr>
                                ) : items.length > 0 ? items.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 font-medium">{item.title}</td>
                                        <td className="px-6 py-4 uppercase text-xs font-bold text-gray-600">{item.fileType}</td>
                                        <td className="px-6 py-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Button variant="secondary" size="sm" onClick={() => window.open(item.fileUrl, '_blank')}>Ver</Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Eliminar</Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="text-center p-8 text-gray-500">No hay recursos en la biblioteca.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            {isModalOpen && (
                <LibraryResourceModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </>
    );
};
