
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface PINInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (pin: string) => void;
}

export const PINInputModal: React.FC<PINInputModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [pin, setPin] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPin('');
        }
    }, [isOpen]);

    const handleInput = (num: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };
    
    const handleConfirm = () => {
        if (pin.length === 4) {
            onConfirm(pin);
        }
    };

    const PinDisplay: React.FC = () => (
        <div className="flex justify-center space-x-4 mb-6">
            {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-12 h-12 border-2 rounded-md flex items-center justify-center">
                    <span className="text-2xl">{pin[i] ? '•' : ''}</span>
                </div>
            ))}
        </div>
    );

    const NumberPad: React.FC = () => {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
        return (
            <div className="grid grid-cols-3 gap-2">
                {keys.map(key => (
                    <Button
                        key={key}
                        type="button"
                        variant="secondary"
                        className="h-14 text-2xl"
                        onClick={() => {
                            if (key === '⌫') handleDelete();
                            else if (key !== '') handleInput(key);
                        }}
                        disabled={key === ''}
                    >
                        {key}
                    </Button>
                ))}
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Compra con PIN">
            <div className="flex flex-col items-center">
                <p className="mb-4 text-gray-600">Ingrese el PIN de 4 dígitos del usuario para autorizar la compra.</p>
                <PinDisplay />
                <div className="w-full max-w-xs">
                    <NumberPad />
                </div>
                <div className="flex justify-between w-full max-w-xs mt-6 gap-2">
                    <Button variant="secondary" onClick={onClose} className="w-1/2">Cancelar</Button>
                    <Button 
                        onClick={handleConfirm} 
                        disabled={pin.length !== 4}
                        className="w-1/2"
                    >
                        Confirmar
                    </Button>
                </div>
            </div>
        </Modal>
    );
};