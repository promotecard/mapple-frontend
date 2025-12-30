import React, { useState, useEffect } from 'react';
import type { ProductCategory } from '../../../types';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Button } from '../../ui/Button';
import { useAppContext } from '../../../context/AppContext';
import { api } from '../../../services/mockApi';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  category: ProductCategory | null;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, category }) => {
    const { currentUser } = useAppContext();
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!category;

    useEffect(() => {
        if (category) setName(category.name);
        else setName('');
    }, [category, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.providerId) return;
        setIsSubmitting(true);
        try {
            if (isEditing && category) {
                await api.updateProductCategory({ ...category, name });
            } else {
                await api.createProductCategory({ name, providerId: currentUser.providerId });
            }
            onSave();
        } catch (err) {
            alert('Error al guardar la categoría.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Editar Categoría' : 'Crear Nueva Categoría'}
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit}>
                <Label htmlFor="categoryName">Nombre de la Categoría</Label>
                <Input id="categoryName" value={name} onChange={e => setName(e.target.value)} required />
            </form>
        </Modal>
    );
};
