import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { Input } from '../ui/Input';

interface POSSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentRate: number;
    onSave: (newRate: number) => void;
}

export const POSSettingsModal: React.FC<POSSettingsModalProps> = ({ isOpen, onClose, currentRate, onSave }) => {
    const [rate, setRate] = useState(currentRate);

    const handleSave = () => {
        // In a real app, this would call an API
        onSave(rate);
        onClose();
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Configuración del POS"
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave}>Guardar Cambios</Button>
                </div>
            }
        >
            <div>
                <Label htmlFor="taxRate">Tasa de Impuestos (%)</Label>
                <Input 
                    id="taxRate"
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                />
                 <p className="text-xs text-gray-500 mt-1">Este impuesto se aplicará al subtotal de todas las ventas del POS.</p>
            </div>
        </Modal>
    );
};