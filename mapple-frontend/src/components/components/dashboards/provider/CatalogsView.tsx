import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import type { ProviderCatalog, Product } from '../../../types';
import { ProviderCatalogModal } from '../../forms/ProviderCatalogModal';

export const CatalogsView: React.FC = () => {
    const { currentUser } = useAppContext();
    const [catalogs, setCatalogs] = useState<ProviderCatalog[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCatalog, setSelectedCatalog] = useState<ProviderCatalog | null>(null);

    const fetchData = useCallback(async () => {
        if (currentUser?.providerId) {
            const [catalogsData, productsData] = await Promise.all([
                api.getProviderCatalogsByProvider(currentUser.providerId),
                api.getProductsByProvider(currentUser.providerId)
            ]);
            setCatalogs(catalogsData);
            setProducts(productsData);
        }
    }, [currentUser?.providerId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = () => {
        fetchData();
        setIsModalOpen(false);
        setSelectedCatalog(null);
    };

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button onClick={() => { setSelectedCatalog(null); setIsModalOpen(true); }}>+ Nuevo Catálogo</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catalogs.map(catalog => (
                    <Card key={catalog.id} className="flex flex-col">
                        <CardHeader>
                            <h3 className="font-bold">{catalog.name}</h3>
                            <p className="text-sm text-gray-500">{catalog.description}</p>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p><strong>Productos:</strong> {catalog.productIds.length}</p>
                            <p><strong>Visibilidad:</strong> <Badge>{catalog.visibilityType}</Badge></p>
                            <p><strong>Hora de entrega:</strong> {catalog.deliveryTime}</p>
                        </CardContent>
                        <div className="p-4 bg-gray-50 border-t">
                            <Button variant="secondary" onClick={() => { setSelectedCatalog(catalog); setIsModalOpen(true); }} className="w-full">
                                Editar Catálogo
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
            {catalogs.length === 0 && <p className="text-center text-gray-500">No has creado ningún catálogo.</p>}

            <ProviderCatalogModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                catalog={selectedCatalog}
                allProducts={products}
            />
        </>
    );
};
