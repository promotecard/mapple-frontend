
import React from 'react';
import type { User } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ResetPinModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    newPin: string;
}

export const ResetPinModal: React.FC<ResetPinModalProps> = ({ isOpen, onClose, user, newPin }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Nuevo PIN para ${user.name}`}
        >
            <div className="text-center p-4">
                <p className="text-gray-600 mb-4">El PIN se ha reseteado. Por favor, guarde este nuevo PIN de forma segura.</p>
                <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg p-4 inline-block">
                    <p className="text-4xl font-mono tracking-widest font-bold text-blue-800">{newPin}</p>
                </div>
                <p className="text-xs text-gray-500 mt-4">Este será su nuevo PIN para compras en el POS.</p>
                <Button onClick={onClose} className="mt-6">Entendido</Button>
            </div>
        </Modal>
    );
};