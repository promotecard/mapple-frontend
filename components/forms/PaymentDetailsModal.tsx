import React from 'react';
import type { PaymentTransaction } from '../../types';
import { Modal } from '../ui/Modal';
import { Label } from '../ui/Label';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: PaymentTransaction;
}

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({ isOpen, onClose, transaction }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalles de Transacción: ${transaction.id}`}
    >
      <div className="space-y-4">
        {transaction.proofUrl && (
          <div>
            <Label>Comprobante de Pago</Label>
            <div className="mt-1 p-2 border rounded-md flex justify-center">
              <img 
                src={transaction.proofUrl} 
                alt="Comprobante de pago" 
                className="max-w-full max-h-80 object-contain"
              />
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div><Label>Concepto</Label><p>{transaction.concept}</p></div>
            <div><Label>Monto</Label><p>{transaction.amount.toFixed(2)} {transaction.currency}</p></div>
            <div><Label>Método</Label><p>{transaction.method}</p></div>
            <div><Label>Fecha</Label><p>{new Date(transaction.date).toLocaleString()}</p></div>
            <div><Label>Estado</Label><p>{transaction.status}</p></div>
        </div>
      </div>
    </Modal>
  );
};
