import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import type { Product, ProductCategory } from '../../../types';
import { ProductModal } from '../../forms/ProductModal';
import { CategoryModal } from './CategoryModal';

const ProductsList: React.FC<{ 
    products: Product[], 
    categories: Map<string, string>, 
    onEdit: (product: Product) => void,
    onDelete: (id: string) => void
}> = ({ products, categories, onEdit, onDelete }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {products.map(product => (
                        <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{product.name}</div></td>
                            <td className="px-6 py-4 whitespace-nowrap"><Badge>{categories.get(product.categoryId || '') || 'Sin categoría'}</Badge></td>
                            <td className="px-6 py-4 whitespace-nowrap">${product.price.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <Button variant="secondary" size="sm" onClick={() => onEdit(product)}>Editar</Button>
                                <Button variant="danger" size="sm" onClick={() => onDelete(product.id)}>Eliminar</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const CategoriesList: React.FC<{ 
    categories: ProductCategory[], 
    onEdit: (category: ProductCategory) => void,
    onDelete: (id: string) => void
}> = ({ categories, onEdit, onDelete }) => {
    return (
        <div className="space-y-3 max-w-md">
            {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{cat.name}</span>
                    <div className="space-x-2">
                        <Button variant="secondary" size="sm" onClick={() => onEdit(cat)}>Editar</Button>
                        <Button variant="danger" size="sm" onClick={() => onDelete(cat.id)}>Eliminar</Button>
                    </div>
                </div>
            ))}
        </div>
    );
};


export const ProductsView: React.FC = () => {
    const { currentUser } = useAppContext();
    const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

    const fetchData = useCallback(async () => {
        if (currentUser?.providerId) {
            const [productsData, categoriesData] = await Promise.all([
                api.getProductsByProvider(currentUser.providerId),
                api.getProductCategoriesByProvider(currentUser.providerId),
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        }
    }, [currentUser?.providerId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = () => {
        fetchData();
        setIsProductModalOpen(false);
        setIsCategoryModalOpen(false);
    };
    
    const handleDeleteProduct = async (id: string) => {
        if (window.confirm('¿Seguro que quieres eliminar este producto?')) {
            await api.deleteProduct(id);
            fetchData();
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (window.confirm('¿Seguro que quieres eliminar esta categoría?')) {
            await api.deleteProductCategory(id);
            fetchData();
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex border-b">
                            <button onClick={() => setActiveTab('products')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'products' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Productos</button>
                            <button onClick={() => setActiveTab('categories')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'categories' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Categorías</button>
                        </div>
                        <Button onClick={() => activeTab === 'products' ? setIsProductModalOpen(true) : setIsCategoryModalOpen(true)}>
                            {activeTab === 'products' ? '+ Nuevo Producto' : '+ Nueva Categoría'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {activeTab === 'products' ? (
                        <>
                            <Input placeholder="Buscar producto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="mb-4 max-w-sm" />
                            <ProductsList 
                                products={filteredProducts} 
                                categories={categoryMap}
                                onEdit={(p) => { setSelectedProduct(p); setIsProductModalOpen(true); }}
                                onDelete={handleDeleteProduct}
                            />
                        </>
                    ) : (
                        <CategoriesList 
                            categories={categories}
                            onEdit={(c) => { setSelectedCategory(c); setIsCategoryModalOpen(true); }}
                            onDelete={handleDeleteCategory}
                        />
                    )}
                </CardContent>
            </Card>

            <ProductModal 
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSave={handleSave}
                product={selectedProduct}
            />
            <CategoryModal 
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onSave={handleSave}
                category={selectedCategory}
            />
        </>
    );
};
