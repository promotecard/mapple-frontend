
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

interface ChangePinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newPin: string) => Promise<void>;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({ isOpen, onClose, onSave }) => {
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPin.length !== 4 || isNaN(Number(newPin))) {
            setError('El PIN debe tener exactamente 4 dígitos numéricos.');
            return;
        }

        if (newPin !== confirmPin) {
            setError('Los PINs no coinciden.');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(newPin);
            setNewPin('');
            setConfirmPin('');
            onClose();
        } catch (err) {
            setError('Error al guardar el PIN.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePinChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
        setter(val);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Cambiar PIN de Seguridad"
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || newPin.length !== 4}>
                        {isSubmitting ? 'Guardando...' : 'Actualizar PIN'}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                    <p className="text-sm text-blue-800">
                        Ingrese un nuevo PIN de 4 dígitos. Este código será solicitado para autorizar compras en la cafetería y puntos de venta.
                    </p>
                </div>
                
                {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md border border-red-200">{error}</div>}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="newPin">Nuevo PIN</Label>
                        <Input 
                            id="newPin" 
                            type="password" 
                            value={newPin} 
                            onChange={handlePinChange(setNewPin)} 
                            placeholder="••••" 
                            className="text-center tracking-widest text-lg font-mono"
                            maxLength={4}
                            autoComplete="off"
                        />
                    </div>
                    <div>
                        <Label htmlFor="confirmPin">Confirmar PIN</Label>
                        <Input 
                            id="confirmPin" 
                            type="password" 
                            value={confirmPin} 
                            onChange={handlePinChange(setConfirmPin)} 
                            placeholder="••••" 
                            className="text-center tracking-widest text-lg font-mono"
                            maxLength={4}
                            autoComplete="off"
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
};
