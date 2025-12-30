import React, { useState } from 'react';
import type { User } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { api } from '../../services/mockApi';

interface AssignCreditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    user: User;
}

export const AssignCreditModal: React.FC<AssignCreditModalProps> = ({ isOpen, onClose, onSave, user }) => {
    const [amount, setAmount] = useState<number | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        const numericAmount = Number(amount);
        if (numericAmount <= 0) {
            setError('Por favor, ingrese un monto positivo.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            await api.assignCreditToStaff(user.id, numericAmount);
            onSave();
        } catch (err) {
            setError('Error al procesar el pago de la deuda.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Pagar Deuda de ${user.name}`}
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !amount}>
                        {isSubmitting ? 'Procesando Pago...' : 'Confirmar Pago'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="p-3 bg-gray-100 rounded-md">
                    <p className="text-sm">Deuda Actual:</p>
                    {/* FIX: Use user.corporateDebt as user.corporateCreditBalance does not exist on User type for staff */}
                    <p className="text-2xl font-bold">${(user.corporateDebt || 0).toFixed(2)}</p>
                </div>
                <div>
                    <Label htmlFor="amount">Monto a Pagar</Label>
                    <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        placeholder="Ej: 5000"
                        min="1"
                    />
                </div>
            </div>
        </Modal>
    );
};