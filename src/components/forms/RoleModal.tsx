import React, { useState, useEffect } from 'react';
import type { Position } from '../../types';
import { Permission } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/mockApi';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  position: Position | null;
}

export const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, onSave, position }) => {
    const { currentUser } = useAppContext();
    const [name, setName] = useState('');
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditing = !!position;

    useEffect(() => {
        if (position) {
            setName(position.name);
            setPermissions(position.permissions);
        } else {
            setName('');
            setPermissions([]);
        }
    }, [position, isOpen]);

    const handlePermissionToggle = (permission: Permission) => {
        setPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.schoolId) return;

        setIsSubmitting(true);
        setError(null);
        
        try {
            if (isEditing && position) {
                await api.updatePosition({ ...position, name, permissions });
            } else {
                await api.createPosition({ name, permissions, schoolId: currentUser.schoolId });
            }
            onSave();
        } catch (err) {
            setError('Failed to save role.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Editar Cargo' : 'Crear Nuevo Cargo'}
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar Cargo'}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}
                <div>
                    <Label htmlFor="roleName">Nombre del Cargo</Label>
                    <Input id="roleName" value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: Coordinador de Primaria" />
                </div>
                
                <div className="pt-4 border-t">
                    <Label>Permisos</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        {Object.values(Permission).map(perm => (
                            <label key={perm} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={permissions.includes(perm)}
                                    onChange={() => handlePermissionToggle(perm)}
                                    className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <span className="text-sm">{perm}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </form>
        </Modal>
    );
};
