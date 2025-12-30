
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { CheckoutModal } from './CheckoutModal';
import type { Provider, ProviderCatalog, Product, OrderItem } from '../../../types';
import { PaymentMethod } from '../../../types';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';


interface CatalogWithProducts extends ProviderCatalog {
    products: Product[];
}

interface ProviderData {
    provider: Provider;
    activeCatalogs: CatalogWithProducts[];
}

type CartState = {
    [providerId: string]: {
        provider: Provider;
        items: OrderItem[];
    }
}

const isCatalogActive = (catalog: ProviderCatalog, schoolId: string): boolean => {
    if (catalog.schoolIds && catalog.schoolIds.length > 0 && !catalog.schoolIds.includes(schoolId)) {
        return false;
    }
    
    const now = new Date();
    switch (catalog.visibilityType) {
        case 'Permanent':
            return true;
        case 'DateRange':
            const startDate = catalog.startDate ? new Date(catalog.startDate) : null;
            const endDate = catalog.endDate ? new Date(catalog.endDate) : null;
            if (startDate && now < startDate) return false;
            if (endDate && now > endDate) return false;
            return true;
        case 'Scheduled':
            if (!catalog.startTime || !catalog.endTime) return false;
            const [startH, startM] = catalog.startTime.split(':').map(Number);
            const [endH, endM] = catalog.endTime.split(':').map(Number);
            const start = new Date();
            start.setHours(startH, startM, 0, 0);
            const end = new Date();
            end.setHours(endH, endM, 0, 0);
            return now >= start && now <= end;
        default:
            return false;
    }
};

const CartSidebar: React.FC<{ cart: CartState, onCheckout: (providerId: string) => void }> = ({ cart, onCheckout }) => {
    const providerIds = Object.keys(cart);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader><h2 className="text-xl font-semibold">Mi Carrito</h2></CardHeader>
            <CardContent className="flex-grow overflow-y-auto p-0">
                {providerIds.length === 0 ? (
                    <p className="text-center text-gray-500 p-4">Tu carrito está vacío.</p>
                ) : (
                    providerIds.map(providerId => {
                        const { provider, items } = cart[providerId];
                        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

                        return (
                            <div key={providerId} className="p-4 border-b">
                                <h3 className="font-bold">{provider.businessName}</h3>
                                <ul className="text-sm my-2 divide-y">
                                    {items.map(item => (
                                        <li key={item.productId} className="py-1 flex justify-between">
                                            <span>{item.quantity}x {item.productName}</span>
                                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="text-right font-semibold">
                                    Subtotal: ${subtotal.toFixed(2)}
                                </div>
                                <Button className="w-full mt-2" size="sm" onClick={() => onCheckout(providerId)}>Pagar</Button>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
};


export const MarketplaceView: React.FC = () => {
    const { currentUser } = useAppContext();
    const [providerData, setProviderData] = useState<ProviderData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cart, setCart] = useState<CartState>({});
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [checkoutProviderId, setCheckoutProviderId] = useState<string | null>(null);
    const [allowedPaymentMethods, setAllowedPaymentMethods] = useState<PaymentMethod[]>([]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('price-asc');

    const fetchData = useCallback(async () => {
        if (!currentUser?.schoolId) return;
        setIsLoading(true);
        const linkedProviders = await api.getProvidersBySchool(currentUser.schoolId);
        const allData = await Promise.all(
            linkedProviders.map(async (provider) => {
                const [catalogs, products] = await Promise.all([
                    api.getProviderCatalogsByProvider(provider.id),
                    api.getProductsByProvider(provider.id)
                ]);
                
                const productMap = new Map(products.map(p => [p.id, p]));

                const activeCatalogs: CatalogWithProducts[] = catalogs
                    .filter(cat => isCatalogActive(cat, currentUser.schoolId!))
                    .map(cat => ({
                        ...cat,
                        products: cat.productIds.map(id => productMap.get(id)).filter((p): p is Product => !!p)
                    }));
                
                return { provider, activeCatalogs };
            })
        );
        setProviderData(allData);
        setIsLoading(false);
    }, [currentUser?.schoolId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const allProducts = useMemo(() => {
        const productsWithProvider = providerData.flatMap(({ provider, activeCatalogs }) =>
            activeCatalogs.flatMap(catalog =>
                catalog.products.map(product => ({ ...product, provider }))
            )
        );

        // Filter
        const filtered = productsWithProvider.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Sort
        return filtered.sort((a, b) => {
            switch (sortOption) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'name-asc': return a.name.localeCompare(b.name);
                case 'name-desc': return b.name.localeCompare(a.name);
                default: return 0;
            }
        });
    }, [providerData, searchTerm, sortOption]);


    const handleAddToCart = (product: Product, provider: Provider) => {
        setCart(prevCart => {
            const newCart = { ...prevCart };
            if (!newCart[provider.id]) {
                newCart[provider.id] = { provider, items: [] };
            }

            const providerCart = newCart[provider.id];
            const existingItem = providerCart.items.find(item => item.productId === product.id);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                providerCart.items.push({
                    productId: product.id,
                    productName: product.name,
                    quantity: 1,
                    price: product.price
                });
            }
            return newCart;
        });
    };
    
    const handleCheckout = (providerId: string) => {
        // Calculate allowed payment methods for this provider
        const targetProviderData = providerData.find(p => p.provider.id === providerId);
        const allowedMethods = new Set<PaymentMethod>();
        
        if (targetProviderData) {
            targetProviderData.activeCatalogs.forEach(cat => {
                if (cat.acceptedPaymentMethods && cat.acceptedPaymentMethods.length > 0) {
                    cat.acceptedPaymentMethods.forEach(m => allowedMethods.add(m));
                } else {
                    // Default fallback if catalog has no config (legacy)
                    allowedMethods.add(PaymentMethod.CreditCard);
                    allowedMethods.add(PaymentMethod.BankTransfer);
                }
            });
        }
        
        // If still empty (no catalogs?), default to basic
        if (allowedMethods.size === 0) {
            allowedMethods.add(PaymentMethod.CreditCard);
            allowedMethods.add(PaymentMethod.BankTransfer);
        }

        setAllowedPaymentMethods(Array.from(allowedMethods));
        setCheckoutProviderId(providerId);
        setIsCheckoutModalOpen(true);
    };

    const handleOrderSuccess = () => {
        if (checkoutProviderId) {
            setCart(prev => {
                const newCart = { ...prev };
                delete newCart[checkoutProviderId];
                return newCart;
            });
        }
    };


    if (isLoading) return <p>Cargando marketplace...</p>;

    return (
        <div className="flex h-[calc(100vh-180px)] gap-6">
            <div className="w-3/4 flex flex-col">
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <h1 className="text-3xl font-bold text-gray-800">Marketplace</h1>
                            <div className="flex items-center gap-4">
                                <Input 
                                    placeholder="Buscar productos..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <Select value={sortOption} onChange={e => setSortOption(e.target.value)}>
                                    <option value="price-asc">Más Económico</option>
                                    <option value="price-desc">Más Caro</option>
                                    <option value="name-asc">Nombre (A-Z)</option>
                                    <option value="name-desc">Nombre (Z-A)</option>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {allProducts.map(product => (
                                <Card key={product.id} className="group overflow-hidden">
                                    <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                                        <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-contain p-2"/>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-sm font-semibold truncate group-hover:text-blue-600">{product.name}</h3>
                                        <p className="text-xs text-gray-500">{product.provider.businessName}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="font-bold">${product.price.toFixed(2)}</p>
                                            <Button size="sm" onClick={() => handleAddToCart(product, product.provider)}>Añadir</Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                         {allProducts.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-gray-500">No se encontraron productos que coincidan con su búsqueda.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="w-1/4">
                <CartSidebar cart={cart} onCheckout={handleCheckout} />
            </div>
            {isCheckoutModalOpen && checkoutProviderId && cart[checkoutProviderId] && (
                 <CheckoutModal
                    isOpen={isCheckoutModalOpen}
                    onClose={() => setIsCheckoutModalOpen(false)}
                    cartData={cart[checkoutProviderId]}
                    onOrderSuccess={handleOrderSuccess}
                    allowedPaymentMethods={allowedPaymentMethods}
                />
            )}
        </div>
    );
};
