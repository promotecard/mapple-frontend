import React, { useState } from 'react';
import type { Student } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/mockApi';

interface AddFundsModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    onSuccess: () => void;
}

const presetAmounts = [500, 1000, 2000];

export const AddFundsModal: React.FC<AddFundsModalProps> = ({ isOpen, onClose, student, onSuccess }) => {
    const { currentUser } = useAppContext();
    const [amount, setAmount] = useState<number | string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);
    };

    const handlePresetClick = (presetAmount: number) => {
        setAmount(presetAmount);
    };

    const handleSubmit = async () => {
        const numericAmount = Number(amount);
        if (!currentUser || !numericAmount || numericAmount <= 0) {
            setError('Por favor ingrese un monto válido.');
            return;
        }

        setIsProcessing(true);
        setError(null);
        
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            await api.addFundsToStudent(currentUser.id, student.id, numericAmount);
            
            onSuccess();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error al procesar el pago.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Añadir Fondos para ${student.name}`}
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose} disabled={isProcessing}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isProcessing || !amount}>
                        {isProcessing ? 'Procesando Pago...' : `Confirmar y Pagar $${Number(amount).toFixed(2)}`}
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}
                
                <div className="p-4 bg-gray-100 rounded-lg text-center">
                    <Label>Balance Actual</Label>
                    <p className="text-3xl font-bold text-gray-800">
                        ${(student.corporateCreditBalance || 0).toFixed(2)}
                    </p>
                </div>
                
                <div>
                    <Label htmlFor="amount">Monto a Recargar (DOP)</Label>
                    <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="Ej: 1500"
                        min="1"
                        step="100"
                    />
                </div>
                
                <div>
                    <Label>O montos rápidos:</Label>
                    <div className="flex space-x-2 mt-1">
                        {presetAmounts.map(pAmount => (
                            <Button
                                key={pAmount}
                                type="button"
                                variant={amount === pAmount ? 'primary' : 'secondary'}
                                onClick={() => handlePresetClick(pAmount)}
                            >
                                ${pAmount}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="p-4 border rounded-md bg-gray-50 space-y-3">
                    <h4 className="font-semibold text-gray-800">Datos de la Tarjeta (Simulación)</h4>
                    <div><Label htmlFor="cardNumber">Número de Tarjeta</Label><Input id="cardNumber" placeholder="**** **** **** 1234" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label htmlFor="expiry">Expiración (MM/AA)</Label><Input id="expiry" placeholder="12/25" /></div>
                        <div><Label htmlFor="cvc">CVC</Label><Input id="cvc" placeholder="123" /></div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};