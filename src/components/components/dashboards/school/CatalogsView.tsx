
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import type { Catalog, Activity } from '../../../types';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { CatalogModal } from '../../forms/CatalogModal';
import { ShareCatalogModal } from '../../forms/ShareCatalogModal';

// Icons
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>;

export const CatalogsView: React.FC = () => {
    const { currentUser } = useAppContext();
    const [catalogs, setCatalogs] = useState<Catalog[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    
    // State for modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
    
    const fetchCatalogs = useCallback(async () => {
        if (currentUser?.schoolId) {
            const [catalogsData, activitiesData] = await Promise.all([
                api.getCatalogsBySchool(currentUser.schoolId),
                api.getActivitiesBySchool(currentUser.schoolId)
            ]);
            setCatalogs(catalogsData);
            setActivities(activitiesData);
        }
    }, [currentUser?.schoolId]);

    useEffect(() => {
        fetchCatalogs();
    }, [fetchCatalogs]);

    const handleCreate = () => {
        setSelectedCatalog(null);
        setIsModalOpen(true);
    };

    const handleEdit = (catalog: Catalog) => {
        setSelectedCatalog(catalog);
        setIsModalOpen(true);
    };
    
    const handleShare = (catalog: Catalog) => {
        setSelectedCatalog(catalog);
        setIsShareModalOpen(true);
    };
    
    const handleSave = () => {
        fetchCatalogs();
        setIsModalOpen(false);
        setSelectedCatalog(null);
    }

    const activityMap = new Map(activities.map(a => [a.id, a.name]));

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-800">Gestión de Programas</h2>
                    <Button onClick={handleCreate}>+ Crear nuevo programa</Button>
                </CardHeader>
                <CardContent>
                    {catalogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {catalogs.map(catalog => (
                                <Card key={catalog.id} className="flex flex-col">
                                    <CardHeader>
                                        <h3 className="font-bold text-lg">{catalog.name}</h3>
                                        <p className="text-sm text-gray-500">{catalog.description}</p>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-sm font-medium text-gray-700">Items: {catalog.items.length}</p>
                                        <ul className="text-xs text-gray-600 list-disc list-inside mt-2">
                                            {catalog.items.slice(0, 3).map(item => <li key={item.id}>{item.name}</li>)}
                                            {catalog.items.length > 3 && <li>...y {catalog.items.length - 3} más.</li>}
                                        </ul>
                                        <p className="text-sm font-medium text-gray-700 mt-2">Actividades Públicas: {catalog.activityIds?.length || 0}</p>
                                         <ul className="text-xs text-gray-600 list-disc list-inside mt-2">
                                            {catalog.activityIds?.slice(0, 3).map(id => <li key={id}>{activityMap.get(id) || 'Actividad no encontrada'}</li>)}
                                            {(catalog.activityIds?.length || 0) > 3 && <li>...y {(catalog.activityIds?.length || 0) - 3} más.</li>}
                                        </ul>
                                    </CardContent>
                                    <div className="p-4 bg-gray-50 border-t flex gap-2">
                                        <Button variant="secondary" onClick={() => handleEdit(catalog)} className="flex-1 text-xs">
                                            Editar
                                        </Button>
                                        <Button variant="primary" onClick={() => handleShare(catalog)} className="flex-1 text-xs flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700">
                                            <ShareIcon /> Compartir
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500">No se han creado programas aún.</p>
                            <Button onClick={handleCreate} className="mt-4">Crear el primero</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            {isModalOpen && (
                <CatalogModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    catalog={selectedCatalog}
                />
            )}

            {isShareModalOpen && selectedCatalog && (
                <ShareCatalogModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    catalog={selectedCatalog}
                />
            )}
        </>
    );
};
