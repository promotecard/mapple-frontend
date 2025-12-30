
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import type { Product, ProductCategory, OrderItem, School, Student, User, Benefit } from '../../../types';
import { PaymentMethod } from '../../../types';
import { POSSettingsModal } from '../../forms/POSSettingsModal';
import { PaymentModal } from '../../forms/PaymentModal';
import { Label } from '../../ui/Label';
import { PINInputModal } from '../../forms/PINInputModal';

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export const POSView: React.FC = () => {
    const { currentUser } = useAppContext();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [schools, setSchools] = useState<School[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [parents, setParents] = useState<User[]>([]);
    const [staff, setStaff] = useState<User[]>([]);
    const [benefits, setBenefits] = useState<Map<string, Benefit>>(new Map());
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [customer, setCustomer] = useState<{ type: 'student' | 'parent'; id: string } | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [staffSearchTerm, setStaffSearchTerm] = useState('');
    const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
    const [activeSubsidy, setActiveSubsidy] = useState<{ percentage: number, amount: number } | null>(null);
    const [taxRate, setTaxRate] = useState(18); // Default, should be loaded from provider settings
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pinAttempts, setPinAttempts] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);

    const fetchData = useCallback(async () => {
        if (currentUser?.providerId) {
            const [providerData, productsData, categoriesData, schoolsData] = await Promise.all([
                api.getProviderById(currentUser.providerId),
                api.getProductsByProvider(currentUser.providerId),
                api.getProductCategoriesByProvider(currentUser.providerId),
                api.getSchoolsByProvider(currentUser.providerId),
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
            setTaxRate(providerData?.posSettings?.taxRate || 18);
            setSchools(schoolsData);
            
            if (schoolsData.length > 0) {
                const schoolStudents = await Promise.all(schoolsData.map(s => api.getStudentsBySchool(s.id)));
                const schoolParents = await Promise.all(schoolsData.map(s => api.getParentsBySchool(s.id)));
                const schoolStaff = await Promise.all(schoolsData.map(s => api.getStaffBySchool(s.id)));
                setStudents(schoolStudents.flat());
                setParents(schoolParents.flat());
                setStaff(schoolStaff.flat());
                
                const schoolBenefits = await Promise.all(schoolsData.map(s => api.getBenefitsBySchool(s.id)));
                const allBenefits = schoolBenefits.flat();
                setBenefits(new Map(allBenefits.map(b => [b.id, b])));
            }
        }
    }, [currentUser?.providerId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (selectedStaff && selectedStaff.benefitId) {
            const benefit = benefits.get(selectedStaff.benefitId);
            if (benefit) {
                setActiveSubsidy({
                    percentage: benefit.subsidyPercentage || 0,
                    amount: benefit.subsidyAmount || 0,
                });
            } else {
                setActiveSubsidy(null);
            }
        } else {
            setActiveSubsidy(null);
        }
    }, [selectedStaff, benefits]);

    const addToCart = (product: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.productId === product.id);
            if (existingItem) {
                return prevCart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prevCart, { productId: product.id, productName: product.name, quantity: 1, price: product.price }];
        });
    };

    const updateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            setCart(prevCart => prevCart.filter(item => item.productId !== productId));
        } else {
            setCart(prevCart => prevCart.map(item => item.productId === productId ? { ...item, quantity: newQuantity } : item));
        }
    };
    
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const originalTotal = subtotal + taxAmount;
    
    let subsidyValue = 0;
    if (activeSubsidy) {
        subsidyValue += originalTotal * (activeSubsidy.percentage / 100);
        subsidyValue += activeSubsidy.amount;
    }
    const finalAmount = Math.max(0, originalTotal - subsidyValue);

    const filteredProducts = products.filter(p => 
        (p.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (categoryFilter === 'all' || p.categoryId === categoryFilter)
    );
    
    const getCustomerName = () => {
        if (selectedStaff) return selectedStaff.name;
        if (selectedStudent) return selectedStudent.name;
        if (!customer) return 'Consumidor Final';
        const entity = customer.type === 'parent' ? parents.find(p => p.id === customer.id) : null;
        return entity?.name || 'Cliente no encontrado';
    };


    const handleFinalizeOrder = async () => {
        if (cart.length === 0 || !currentUser?.providerId) return;

        if (paymentMethod === PaymentMethod.CorporateCredit) {
            if (!selectedStaff) {
                alert("Por favor, seleccione un miembro del personal.");
                return;
            }
            
            const debtToAdd = finalAmount;
            const currentDebt = selectedStaff.corporateDebt || 0;
            const creditLimit = selectedStaff.creditLimit || 0;

            if (currentDebt + debtToAdd > creditLimit) {
                alert(`Límite de crédito excedido. Límite: $${creditLimit.toFixed(2)}, Deuda Actual: $${currentDebt.toFixed(2)}, Nuevo Consumo: $${debtToAdd.toFixed(2)}.`);
                return;
            }
            
            // Reset attempts and open PIN modal
            setPinAttempts(0);
            setIsPinModalOpen(true);
            return;
        }

        if (paymentMethod === PaymentMethod.StudentBalance) {
            if (!selectedStudent) {
                alert("Por favor, seleccione un estudiante.");
                return;
            }
            const balance = selectedStudent.corporateCreditBalance || 0;
            if (finalAmount > balance) {
                alert(`Saldo insuficiente. Saldo disponible: $${balance.toFixed(2)}, Total de la compra: $${finalAmount.toFixed(2)}.`);
                return;
            }
            // Reset attempts and open PIN modal
            setPinAttempts(0);
            setIsPinModalOpen(true);
            return;
        }
    
        if (paymentMethod === PaymentMethod.CreditCard || paymentMethod === PaymentMethod.BankTransfer) {
            setIsPaymentModalOpen(true);
            return;
        }

        await createOrder();
    };

    const handlePinVerification = async (enteredPin: string) => {
        // Verify PIN for staff
        if (paymentMethod === PaymentMethod.CorporateCredit && selectedStaff) {
             // In a real app, verify against a hashed PIN on server.
             // For mock, we check against the user object.
             if (enteredPin === selectedStaff.pin) {
                 await createOrder(enteredPin);
                 setIsPinModalOpen(false);
             } else {
                 handleFailedPinAttempt();
             }
        } 
        // Verify PIN for student
        else if (paymentMethod === PaymentMethod.StudentBalance && selectedStudent) {
             if (enteredPin === selectedStudent.pin) {
                 await createOrder(enteredPin);
                 setIsPinModalOpen(false);
             } else {
                 handleFailedPinAttempt();
             }
        }
    };

    const handleFailedPinAttempt = () => {
        const newAttempts = pinAttempts + 1;
        setPinAttempts(newAttempts);
        if (newAttempts >= 3) {
            alert("¡PIN Incorrecto! Se han superado los intentos permitidos. Se ha enviado una notificación al usuario.");
            // Simulate sending alert
            console.warn("ALERTA DE SEGURIDAD: Múltiples intentos de PIN fallidos para el usuario.");
            setIsPinModalOpen(false);
        } else {
            alert(`PIN Incorrecto. Intentos restantes: ${3 - newAttempts}`);
        }
    };

    const createOrder = async (pin?: string) => {
        if (cart.length === 0 || !currentUser?.providerId) return;
        
        const finalPaymentMethod = selectedStaff ? PaymentMethod.CorporateCredit : selectedStudent ? PaymentMethod.StudentBalance : paymentMethod;

        try {
            await api.createOrder({
                providerId: currentUser.providerId,
                schoolId: selectedStaff?.schoolId || selectedStudent?.schoolId || schools[0]?.id || '',
                studentId: selectedStudent ? selectedStudent.id : undefined,
                staffId: selectedStaff ? selectedStaff.id : undefined,
                customerName: getCustomerName(),
                items: cart,
                subtotal, 
                taxAmount, 
                finalAmount: paymentMethod === PaymentMethod.CorporateCredit ? finalAmount : originalTotal,
                paymentMethod: finalPaymentMethod,
                status: 'Delivered', // POS orders are delivered instantly
                orderDate: new Date().toISOString()
            }, pin);

            alert("¡Venta completada!");
            setCart([]);
            setCustomer(null);
            setSelectedStudent(null);
            setSelectedStaff(null);
            setStaffSearchTerm('');
            
            if(selectedStaff || selectedStudent) {
                await fetchData();
            }
        } catch (error: any) {
            alert(`Error al crear la orden: ${error.message}`);
        } finally {
            setIsPaymentModalOpen(false);
            setIsPinModalOpen(false);
        }
    };

    return (
        <>
            <div className="flex h-[calc(100vh-180px)] gap-6">
                {/* Product Grid */}
                <div className="w-3/5 flex flex-col">
                    <Card className="flex-grow flex flex-col">
                        <CardHeader className="flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-grow">
                                    <Input placeholder="Buscar productos..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3"><SearchIcon /></div>
                                </div>
                                <Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-48">
                                    <option value="all">Todas las categorías</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow overflow-y-auto p-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredProducts.map(product => (
                                    <button key={product.id} onClick={() => addToCart(product)} className="border rounded-lg p-2 text-center hover:shadow-md hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <img src={product.imageUrl} alt={product.name} className="w-full h-24 object-contain mb-2" />
                                        <p className="text-sm font-medium truncate">{product.name}</p>
                                        <p className="text-xs text-gray-600">${product.price.toFixed(2)}</p>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Cart & Payment */}
                <div className="w-2/5 flex flex-col">
                    <Card className="flex-grow flex flex-col">
                        <CardHeader className="flex-shrink-0 flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Pedido Actual</h2>
                             <Button variant="secondary" size="sm" onClick={() => setIsSettingsModalOpen(true)}><SettingsIcon/></Button>
                        </CardHeader>
                        <CardContent className="flex-grow overflow-y-auto p-2">
                            {cart.length > 0 ? (
                                <ul className="divide-y">
                                    {cart.map(item => (
                                        <li key={item.productId} className="flex items-center p-2">
                                            <div className="flex-grow">
                                                <p className="text-sm font-medium">{item.productName}</p>
                                                <p className="text-xs text-gray-500">${item.price.toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Input type="number" value={item.quantity} onChange={e => updateQuantity(item.productId, parseInt(e.target.value) || 0)} className="w-16 text-center h-8" />
                                            </div>
                                            <p className="w-20 text-right font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-center text-gray-500 p-8">El carrito está vacío</p>}
                        </CardContent>
                        <div className="p-4 border-t space-y-3 flex-shrink-0">
                            <div className="space-y-2">
                                <Label>Venta a Personal (Crédito Corporativo)</Label>
                                <Input
                                    placeholder="Buscar empleado por nombre..."
                                    value={staffSearchTerm}
                                    onChange={(e) => {
                                        setStaffSearchTerm(e.target.value);
                                        setSelectedStaff(null);
                                    }}
                                />
                                {staffSearchTerm && !selectedStaff && (
                                    <div className="border rounded max-h-32 overflow-y-auto z-10 bg-white absolute w-[calc(40%-3rem)]">
                                        {staff
                                            .filter(s => s.name.toLowerCase().includes(staffSearchTerm.toLowerCase()))
                                            .map(s => (
                                                <div
                                                    key={s.id}
                                                    className="p-2 cursor-pointer hover:bg-gray-100"
                                                    onClick={() => {
                                                        setSelectedStaff(s);
                                                        setStaffSearchTerm(s.name);
                                                        setCustomer(null); 
                                                        setSelectedStudent(null);
                                                    }}
                                                >
                                                    {s.name}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                             <Select disabled={!!selectedStaff} value={customer ? `${customer.type}-${customer.id}` : ''} onChange={e => {
                                const [type, id] = e.target.value.split('-');
                                if (type && id) {
                                    setCustomer({ type: type as any, id });
                                    if(type === 'student') {
                                        setSelectedStudent(students.find(s => s.id === id) || null);
                                    } else {
                                        setSelectedStudent(null);
                                    }
                                } else {
                                    setCustomer(null);
                                    setSelectedStudent(null);
                                }
                                setSelectedStaff(null);
                                setStaffSearchTerm('');
                             }}>
                                <option value="">Consumidor Final</option>
                                <optgroup label="Estudiantes">
                                    {students.map(s => <option key={`student-${s.id}`} value={`student-${s.id}`}>{s.name}</option>)}
                                </optgroup>
                                <optgroup label="Padres">
                                    {parents.map(p => <option key={`parent-${p.id}`} value={`parent-${p.id}`}>{p.name}</option>)}
                                </optgroup>
                             </Select>

                            {selectedStudent && (
                                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-center">
                                    <img src={selectedStudent.avatarUrl} alt={selectedStudent.name} className="w-16 h-16 rounded-full mx-auto mb-2"/>
                                    <p className="font-semibold">Cliente: {selectedStudent.name}</p>
                                    <p>Balance Disponible: <span className="font-bold">${(selectedStudent.corporateCreditBalance || 0).toFixed(2)}</span></p>
                                </div>
                            )}

                            {selectedStaff && (
                                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                                    <p className="font-semibold">Cliente: {selectedStaff.name}</p>
                                    <p>Crédito Disponible: <span className="font-bold">${((selectedStaff.creditLimit || 0) - (selectedStaff.corporateDebt || 0)).toFixed(2)}</span></p>
                                </div>
                            )}

                             <div className="text-sm space-y-1">
                                <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Impuestos ({taxRate}%):</span><span>${taxAmount.toFixed(2)}</span></div>
                                <div className="flex justify-between border-t pt-1"><strong>Total Original:</strong><strong>${originalTotal.toFixed(2)}</strong></div>
                                {activeSubsidy && subsidyValue > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Subsidio Aplicado:</span>
                                        <span>-${subsidyValue.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg border-t pt-1">
                                    <span>TOTAL A PAGAR:</span>
                                    <span>${finalAmount.toFixed(2)}</span>
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-2">
                                <Button variant={paymentMethod === PaymentMethod.Cash ? 'primary' : 'secondary'} onClick={() => setPaymentMethod(PaymentMethod.Cash)}>Efectivo</Button>
                                <Button variant={paymentMethod === PaymentMethod.CreditCard ? 'primary' : 'secondary'} onClick={() => setPaymentMethod(PaymentMethod.CreditCard)}>Tarjeta</Button>
                                <Button variant={paymentMethod === PaymentMethod.BankTransfer ? 'primary' : 'secondary'} onClick={() => setPaymentMethod(PaymentMethod.BankTransfer)}>Transf.</Button>
                                <Button variant={paymentMethod === PaymentMethod.CorporateCredit ? 'primary' : 'secondary'} onClick={() => setPaymentMethod(PaymentMethod.CorporateCredit)} disabled={!selectedStaff}>Crédito Empresa</Button>
                                <Button variant={paymentMethod === PaymentMethod.StudentBalance ? 'primary' : 'secondary'} onClick={() => setPaymentMethod(PaymentMethod.StudentBalance)} disabled={!selectedStudent || (selectedStudent.corporateCreditBalance || 0) <= 0} className="col-span-2">Saldo Estudiantil</Button>
                             </div>

                             <Button onClick={handleFinalizeOrder} disabled={cart.length === 0} className="w-full text-lg">
                                Finalizar Venta
                             </Button>
                        </div>
                    </Card>
                </div>
            </div>

            <POSSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} currentRate={taxRate} onSave={setTaxRate} />
            <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} amount={finalAmount} onPaymentSuccess={() => createOrder()} />
            {isPinModalOpen && (
                <PINInputModal
                    isOpen={isPinModalOpen}
                    onClose={() => setIsPinModalOpen(false)}
                    onConfirm={handlePinVerification}
                />
            )}
        </>
    );
};