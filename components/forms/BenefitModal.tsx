import React, { useState, useEffect } from 'react';
import type { Benefit } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/mockApi';

interface BenefitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  benefit: Benefit | null;
}

export const BenefitModal: React.FC<BenefitModalProps> = ({ isOpen, onClose, onSave, benefit }) => {
    const { currentUser } = useAppContext();
    const [name, setName] = useState('');
    const [subsidyPercentage, setSubsidyPercentage] = useState<number | ''>('');
    const [subsidyAmount, setSubsidyAmount] = useState<number | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditing = !!benefit;

    useEffect(() => {
        if (benefit) {
            setName(benefit.name);
            setSubsidyPercentage(benefit.subsidyPercentage ?? '');
            setSubsidyAmount(benefit.subsidyAmount ?? '');
        } else {
            setName('');
            setSubsidyPercentage('');
            setSubsidyAmount('');
        }
    }, [benefit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.schoolId) return;

        setIsSubmitting(true);
        
        const data = {
            schoolId: currentUser.schoolId,
            name,
            subsidyPercentage: Number(subsidyPercentage) || undefined,
            subsidyAmount: Number(subsidyAmount) || undefined,
        };

        try {
            if (isEditing && benefit) {
                await api.updateBenefit({ ...benefit, ...data });
            } else {
                await api.createBenefit(data);
            }
            onSave();
        } catch (err) {
            alert('Failed to save benefit.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Editar Beneficio' : 'Crear Nuevo Beneficio'}
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar Beneficio'}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="benefitName">Nombre del Beneficio</Label>
                    <Input id="benefitName" value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: Subsidio Cafetería, Beneficio Admin" />
                </div>
                <p className="text-sm text-gray-500">
                    Puede configurar un subsidio como porcentaje, monto fijo, o ambos. Se aplicarán al total de la compra.
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="subsidyPercentage">Subsidio en Porcentaje (%)</Label>
                        <Input id="subsidyPercentage" type="number" value={subsidyPercentage} onChange={e => setSubsidyPercentage(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ej: 25" min="0" max="100" />
                    </div>
                    <div>
                        <Label htmlFor="subsidyAmount">Subsidio en Monto Fijo ($)</Label>
                        <Input id="subsidyAmount" type="number" value={subsidyAmount} onChange={e => setSubsidyAmount(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ej: 50.00" min="0" step="0.01" />
                    </div>
                </div>
            </form>
        </Modal>
    );
};