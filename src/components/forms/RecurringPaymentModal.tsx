import React, { useState } from 'react';
import type { RecurringPayment } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/mockApi';

interface RecurringPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const RecurringPaymentModal: React.FC<RecurringPaymentModalProps> = ({ isOpen, onClose, onSave }) => {
  const { currentUser } = useAppContext();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState<'DOP' | 'USD'>('DOP');
  const [frequency, setFrequency] = useState<'Monthly' | 'Annual' | 'OneTime'>('Monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.schoolId) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      const newPayment: Omit<RecurringPayment, 'id'> = {
        schoolId: currentUser.schoolId,
        name,
        amount,
        currency,
        frequency,
      };
      await api.createRecurringPayment(newPayment);
      onSave();
    } catch (err) {
      setError('Failed to save recurring payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Concepto de Pago Recurrente"
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Concepto'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}
        <div>
          <Label htmlFor="rpName">Nombre del Concepto</Label>
          <Input id="rpName" value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: Mensualidad Escolar 2024" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rpAmount">Monto</Label>
            <Input id="rpAmount" type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} required min="0" />
          </div>
          <div>
            <Label htmlFor="rpCurrency">Moneda</Label>
            <Select id="rpCurrency" value={currency} onChange={e => setCurrency(e.target.value as 'DOP' | 'USD')}>
              <option value="DOP">DOP</option>
              <option value="USD">USD</option>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="rpFrequency">Frecuencia</Label>
          <Select id="rpFrequency" value={frequency} onChange={e => setFrequency(e.target.value as 'Monthly' | 'Annual' | 'OneTime')}>
            <option value="Monthly">Mensual</option>
            <option value="Annual">Anual</option>
            <option value="OneTime">Pago Único</option>
          </Select>
        </div>
      </form>
    </Modal>
  );
};