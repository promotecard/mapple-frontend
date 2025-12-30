
import React, { useState, useEffect } from 'react';
import type { OrderItem, Provider, Student, Order } from '../../../types';
import { PaymentMethod } from '../../../types';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Label } from '../../ui/Label';
import { Select } from '../../ui/Select';
import { Input } from '../../ui/Input';
import { useAppContext } from '../../../context/AppContext';
import { api } from '../../../services/mockApi';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    cartData: {
        provider: Provider;
        items: OrderItem[];
    };
    onOrderSuccess: () => void;
    allowedPaymentMethods?: PaymentMethod[];
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
    isOpen, 
    onClose, 
    cartData, 
    onOrderSuccess,
    allowedPaymentMethods = [PaymentMethod.CreditCard, PaymentMethod.BankTransfer] // Default for fallback
}) => {
    const { currentUser, login } = useAppContext();
    const [students, setStudents] = useState<Student[]>([]);
    const [deliveryOption, setDeliveryOption] = useState<'student'>('student');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Card Selection State
    const [selectedCardId, setSelectedCardId] = useState<string>('new');
    const [saveNewCard, setSaveNewCard] = useState(false);
    const [newCardData, setNewCardData] = useState({ number: '', expiry: '', cvc: '', name: '' });

    useEffect(() => {
        if (isOpen && currentUser) {
            api.getStudentsByParent(currentUser.id).then(data => {
                setStudents(data);
                if (data.length > 0) {
                    setSelectedStudentId(data[0].id);
                }
            });
            // Set default selected method if available
            if (allowedPaymentMethods.length > 0) {
                setPaymentMethod(allowedPaymentMethods[0]);
            }
            
            // Set default saved card if available
            if (currentUser.savedCards && currentUser.savedCards.length > 0) {
                setSelectedCardId(currentUser.savedCards[0].id);
            } else {
                setSelectedCardId('new');
            }
            setNewCardData({ number: '', expiry: '', cvc: '', name: '' });
            setSaveNewCard(false);
        }
    }, [isOpen, currentUser, allowedPaymentMethods]);

    const { provider, items } = cartData;
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * ((provider.posSettings?.taxRate || 0) / 100);
    const total = subtotal + tax;

    const handleSubmit = async () => {
        if (!currentUser?.schoolId || !currentUser.id || !paymentMethod) return;

        if (deliveryOption === 'student' && !selectedStudentId) {
            setError('Por favor, seleccione a cuál de sus hijos se le debe entregar el pedido.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Simulate payment processing & Save Card if needed
            if(paymentMethod === PaymentMethod.CreditCard) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                if (selectedCardId === 'new' && saveNewCard) {
                     const [month, year] = newCardData.expiry.split('/');
                     await api.addSavedCard(currentUser.id, {
                        brand: 'Visa', // Mock
                        last4: newCardData.number.slice(-4),
                        expiryMonth: month || '12',
                        expiryYear: year || '30',
                        holderName: newCardData.name
                    });
                    await login(currentUser.id); // Refresh user state
                }
            }

            await api.createOrder({
                providerId: provider.id,
                schoolId: currentUser.schoolId,
                parentId: currentUser.id,
                studentId: deliveryOption === 'student' ? selectedStudentId : undefined,
                customerName: currentUser.name,
                items: items,
                subtotal: subtotal,
                taxAmount: tax,
                finalAmount: total,
                paymentMethod: paymentMethod,
                status: 'Pending',
                orderDate: new Date().toISOString()
            });
            setShowSuccess(true);
        } catch(err) {
            setError('Hubo un error al procesar el pedido. Por favor, intente de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseAndReset = () => {
        setShowSuccess(false);
        onOrderSuccess(); 
        onClose();
    };

    if (showSuccess) {
        return (
            <Modal isOpen={isOpen} onClose={handleCloseAndReset} title="Pedido Realizado">
                <div className="text-center p-6">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">¡Tu pedido ha sido recibido!</h3>
                    <p className="mt-2 text-sm text-gray-500">El proveedor ha sido notificado y comenzará a preparar tu orden.</p>
                    <Button onClick={handleCloseAndReset} className="mt-4">Finalizar</Button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Finalizar Compra - ${provider.businessName}`}
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !paymentMethod}>
                        {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}
                
                <div>
                    <Label>Resumen del Pedido</Label>
                    <div className="border rounded-md p-3 bg-gray-50 max-h-40 overflow-y-auto">
                        <ul className="text-sm space-y-1">
                            {items.map(item => (
                                <li key={item.productId} className="flex justify-between">
                                    <span>{item.quantity}x {item.productName}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="text-sm space-y-1 pt-2 mt-2">
                        <p className="flex justify-between"><span>Subtotal:</span> <span>${subtotal.toFixed(2)}</span></p>
                        <p className="flex justify-between"><span>Impuestos:</span> <span>${tax.toFixed(2)}</span></p>
                        <p className="flex justify-between font-bold text-base"><span>Total a Pagar:</span> <span>${total.toFixed(2)}</span></p>
                    </div>
                </div>

                <div>
                    <Label>Entregar a:</Label>
                    <Select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="mt-1 text-sm">
                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                </div>

                <div>
                    <Label>Método de Pago</Label>
                    {allowedPaymentMethods.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            {allowedPaymentMethods.includes(PaymentMethod.CreditCard) && (
                                <Button 
                                    type="button" 
                                    variant={paymentMethod === PaymentMethod.CreditCard ? 'primary' : 'secondary'} 
                                    onClick={() => setPaymentMethod(PaymentMethod.CreditCard)}
                                >
                                    Tarjeta de Crédito
                                </Button>
                            )}
                            {allowedPaymentMethods.includes(PaymentMethod.BankTransfer) && (
                                <Button 
                                    type="button" 
                                    variant={paymentMethod === PaymentMethod.BankTransfer ? 'primary' : 'secondary'} 
                                    onClick={() => setPaymentMethod(PaymentMethod.BankTransfer)}
                                >
                                    Transferencia
                                </Button>
                            )}
                            {allowedPaymentMethods.includes(PaymentMethod.Cash) && (
                                <Button 
                                    type="button" 
                                    variant={paymentMethod === PaymentMethod.Cash ? 'primary' : 'secondary'} 
                                    onClick={() => setPaymentMethod(PaymentMethod.Cash)}
                                >
                                    Efectivo
                                </Button>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-red-500">No hay métodos de pago disponibles para este catálogo.</p>
                    )}
                </div>

                {paymentMethod === PaymentMethod.CreditCard && (
                    <div className="p-4 border rounded-md bg-gray-50 space-y-3">
                         <h4 className="font-semibold text-gray-800">Selección de Tarjeta</h4>
                         
                         {/* Saved Cards */}
                         {currentUser?.savedCards && currentUser.savedCards.length > 0 && (
                            <div className="space-y-2 mb-3">
                                {currentUser.savedCards.map(card => (
                                    <label key={card.id} className={`flex items-center p-2 border rounded cursor-pointer bg-white ${selectedCardId === card.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}>
                                        <input 
                                            type="radio" 
                                            name="cardSelection" 
                                            value={card.id} 
                                            checked={selectedCardId === card.id} 
                                            onChange={(e) => setSelectedCardId(e.target.value)}
                                            className="mr-3"
                                        />
                                        <div className="text-sm">
                                            <span className="font-bold">{card.brand}</span> •••• {card.last4}
                                        </div>
                                    </label>
                                ))}
                                <label className={`flex items-center p-2 border rounded cursor-pointer bg-white ${selectedCardId === 'new' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}>
                                    <input 
                                        type="radio" 
                                        name="cardSelection" 
                                        value="new" 
                                        checked={selectedCardId === 'new'} 
                                        onChange={(e) => setSelectedCardId(e.target.value)}
                                        className="mr-3"
                                    />
                                    <span className="text-sm font-medium">Usar nueva tarjeta</span>
                                </label>
                            </div>
                         )}

                         {/* New Card Fields */}
                         {selectedCardId === 'new' && (
                             <>
                                 <div><Label htmlFor="cardNumber">Número de Tarjeta</Label><Input id="cardNumber" placeholder="**** **** **** 1234" value={newCardData.number} onChange={e => setNewCardData({...newCardData, number: e.target.value})} /></div>
                                 <div><Label htmlFor="cardName">Nombre del Titular</Label><Input id="cardName" placeholder="Nombre en la tarjeta" value={newCardData.name} onChange={e => setNewCardData({...newCardData, name: e.target.value})} /></div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div><Label htmlFor="expiry">Expiración (MM/AA)</Label><Input id="expiry" placeholder="12/25" value={newCardData.expiry} onChange={e => setNewCardData({...newCardData, expiry: e.target.value})} /></div>
                                    <div><Label htmlFor="cvc">CVC</Label><Input id="cvc" placeholder="123" value={newCardData.cvc} onChange={e => setNewCardData({...newCardData, cvc: e.target.value})} /></div>
                                 </div>
                                 <div className="flex items-center mt-2">
                                    <input 
                                        type="checkbox" 
                                        id="saveCard" 
                                        checked={saveNewCard} 
                                        onChange={(e) => setSaveNewCard(e.target.checked)}
                                        className="h-4 w-4 text-blue-600 rounded mr-2"
                                    />
                                    <label htmlFor="saveCard" className="text-sm text-gray-700">Guardar tarjeta para futuros pagos</label>
                                </div>
                             </>
                         )}
                    </div>
                )}

                {paymentMethod === PaymentMethod.BankTransfer && (
                    <div className="p-4 border rounded-md bg-gray-50 space-y-2 text-sm">
                        <h4 className="font-semibold text-gray-800">Instrucciones para Transferencia</h4>
                        <p className="text-xs">Por favor, transfiera el monto total a la siguiente cuenta y suba el comprobante en su sección de "Mis Pedidos" para confirmar la orden.</p>
                        <ul className="list-disc list-inside ml-4 text-xs">
                            <li><strong>Banco:</strong> Banco Popular</li>
                            <li><strong>Cuenta:</strong> 123-456789-0</li>
                            <li><strong>A nombre de:</strong> {provider.businessName}</li>
                            <li><strong>Referencia:</strong> Pedido Online</li>
                        </ul>
                    </div>
                )}
                
                {paymentMethod === PaymentMethod.Cash && (
                    <div className="p-4 border rounded-md bg-gray-50 space-y-2 text-sm">
                        <h4 className="font-semibold text-gray-800">Pago Contra Entrega</h4>
                        <p className="text-xs">Deberá realizar el pago en efectivo al momento de recibir su pedido en el colegio.</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};
