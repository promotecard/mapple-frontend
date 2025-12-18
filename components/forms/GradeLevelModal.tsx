import React, { useState, useEffect } from 'react';
import type { GradeLevel } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/mockApi';

interface GradeLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  gradeLevel: GradeLevel | null;
}

export const GradeLevelModal: React.FC<GradeLevelModalProps> = ({ isOpen, onClose, onSave, gradeLevel }) => {
    const { currentUser } = useAppContext();
    const [name, setName] = useState('');
    const [order, setOrder] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditing = !!gradeLevel;

    useEffect(() => {
        if (gradeLevel) {
            setName(gradeLevel.name);
            setOrder(gradeLevel.order);
        } else {
            setName('');
            setOrder(0);
        }
    }, [gradeLevel, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.schoolId) return;

        setIsSubmitting(true);
        setError(null);
        
        try {
            if (isEditing && gradeLevel) {
                await api.updateGradeLevel({ ...gradeLevel, name, order });
            } else {
                await api.createGradeLevel({ name, order, schoolId: currentUser.schoolId });
            }
            onSave();
        } catch (err: any) {
            setError(err.message || 'Failed to save grade level.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Editar Nivel de Grado' : 'Crear Nuevo Nivel de Grado'}
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}
                <div>
                    <Label htmlFor="gradeName">Nombre del Nivel</Label>
                    <Input id="gradeName" value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: 1ro de Primaria" />
                </div>
                <div>
                    <Label htmlFor="gradeOrder">Orden</Label>
                    <Input id="gradeOrder" type="number" value={order} onChange={e => setOrder(parseInt(e.target.value, 10) || 0)} required />
                    <p className="text-xs text-gray-500 mt-1">Se usa para ordenar los grados correctamente (ej: Kinder-1, Primaria-2).</p>
                </div>
            </form>
        </Modal>
    );
};
