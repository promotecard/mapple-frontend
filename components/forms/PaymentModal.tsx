
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/mockApi';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, amount, onPaymentSuccess }) => {
    const { currentUser, login } = useAppContext();
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Card Selection State
    const [selectedCardId, setSelectedCardId] = useState<string>('new');
    const [saveNewCard, setSaveNewCard] = useState(false);
    
    // New Card Form State
    const [newCardData, setNewCardData] = useState({
        number: '',
        expiry: '',
        cvc: '',
        name: ''
    });

    useEffect(() => {
        if (isOpen && currentUser?.savedCards && currentUser.savedCards.length > 0) {
            setSelectedCardId(currentUser.savedCards[0].id);
        } else {
            setSelectedCardId('new');
        }
        setNewCardData({ number: '', expiry: '', cvc: '', name: '' });
        setSaveNewCard(false);
    }, [isOpen, currentUser]);

    const handlePayment = async () => {
        setIsProcessing(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // If "Save Card" is checked and we are using a new card
        if (selectedCardId === 'new' && saveNewCard && currentUser) {
            const [month, year] = newCardData.expiry.split('/');
            await api.addSavedCard(currentUser.id, {
                brand: 'Visa', // Mock
                last4: newCardData.number.slice(-4),
                expiryMonth: month || '12',
                expiryYear: year || '30',
                holderName: newCardData.name
            });
            await login(currentUser.id); // Refresh user data
        }

        setIsProcessing(false);
        onPaymentSuccess();
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Procesar Pago"
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose} disabled={isProcessing}>Cancelar</Button>
                    <Button onClick={handlePayment} disabled={isProcessing}>
                        {isProcessing ? 'Procesando...' : `Pagar $${amount.toFixed(2)}`}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <p>Monto a pagar: <span className="font-bold text-xl">${amount.toFixed(2)}</span></p>
                
                {/* Saved Cards Selection */}
                {currentUser?.savedCards && currentUser.savedCards.length > 0 && (
                    <div className="space-y-2 mb-4">
                        <Label>Seleccionar Método de Pago</Label>
                        {currentUser.savedCards.map(card => (
                            <label key={card.id} className={`flex items-center p-3 border rounded-lg cursor-pointer ${selectedCardId === card.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                <input 
                                    type="radio" 
                                    name="paymentMethod" 
                                    value={card.id} 
                                    checked={selectedCardId === card.id} 
                                    onChange={(e) => setSelectedCardId(e.target.value)}
                                    className="mr-3 text-blue-600 focus:ring-blue-500"
                                />
                                <div>
                                    <p className="font-medium text-gray-800">{card.brand} •••• {card.last4}</p>
                                    <p className="text-xs text-gray-500">Expira: {card.expiryMonth}/{card.expiryYear}</p>
                                </div>
                            </label>
                        ))}
                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${selectedCardId === 'new' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                            <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="new" 
                                checked={selectedCardId === 'new'} 
                                onChange={(e) => setSelectedCardId(e.target.value)}
                                className="mr-3 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="font-medium text-gray-800">Usar otra tarjeta</span>
                        </label>
                    </div>
                )}

                {/* New Card Form */}
                {selectedCardId === 'new' && (
                    <div className="space-y-4 pt-2 border-t">
                        <div>
                            <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                            <Input 
                                id="cardNumber" 
                                placeholder="**** **** **** 1234" 
                                value={newCardData.number}
                                onChange={e => setNewCardData({...newCardData, number: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label htmlFor="cardName">Nombre del Titular</Label>
                            <Input 
                                id="cardName" 
                                placeholder="Como aparece en la tarjeta" 
                                value={newCardData.name}
                                onChange={e => setNewCardData({...newCardData, name: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="expiry">Expiración (MM/AA)</Label>
                                <Input 
                                    id="expiry" 
                                    placeholder="12/25" 
                                    value={newCardData.expiry}
                                    onChange={e => setNewCardData({...newCardData, expiry: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label htmlFor="cvc">CVC</Label>
                                <Input 
                                    id="cvc" 
                                    placeholder="123" 
                                    value={newCardData.cvc}
                                    onChange={e => setNewCardData({...newCardData, cvc: e.target.value})}
                                />
                            </div>
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
                    </div>
                )}
            </div>
        </Modal>
    );
};
