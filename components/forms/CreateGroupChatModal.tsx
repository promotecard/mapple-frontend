import React, { useState, useEffect } from 'react';
import type { User } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/mockApi';

interface CreateGroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const CreateGroupChatModal: React.FC<CreateGroupChatModalProps> = ({ isOpen, onClose, onSave }) => {
    const { currentUser } = useAppContext();
    const [groupName, setGroupName] = useState('');
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && currentUser?.schoolId) {
            const fetchUsers = async () => {
                const [parents, staff] = await Promise.all([
                    api.getParentsBySchool(currentUser.schoolId!),
                    api.getStaffBySchool(currentUser.schoolId!)
                ]);
                // Exclude current user from the list of people to add
                const allUsers = [...parents, ...staff].filter(u => u.id !== currentUser.id);
                setAvailableUsers(allUsers);
            };
            fetchUsers();
        } else {
            // Reset state on close
            setGroupName('');
            setSelectedUserIds([]);
            setSearchTerm('');
        }
    }, [isOpen, currentUser]);

    const handleToggleUser = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSubmit = async () => {
        if (!groupName.trim() || selectedUserIds.length === 0 || !currentUser) {
            alert('Por favor, asigne un nombre al grupo y seleccione al menos un miembro.');
            return;
        }
        setIsSubmitting(true);
        try {
            await api.createGroupConversation(currentUser.id, groupName, selectedUserIds);
            onSave();
        } catch (error) {
            alert('Error al crear el grupo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredUsers = availableUsers.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Crear Nuevo Grupo de Conversación"
            footer={
                <div className="flex justify-between items-center w-full">
                    <p className="text-sm text-gray-600">Seleccionados: {selectedUserIds.length} miembro(s).</p>
                    <div className="space-x-2">
                        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Creando...' : 'Crear Grupo'}
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <Label htmlFor="groupName">Nombre del Grupo</Label>
                    <Input id="groupName" value={groupName} onChange={e => setGroupName(e.target.value)} required />
                </div>
                <div>
                    <Label>Añadir Miembros</Label>
                    <Input
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="my-2"
                    />
                    <div className="border rounded-md h-64 overflow-y-auto p-2 bg-gray-50">
                        {filteredUsers.map(user => (
                            <label key={user.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedUserIds.includes(user.id)}
                                    onChange={() => handleToggleUser(user.id)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                                <div>
                                    <span className="font-medium text-sm text-gray-800">{user.name}</span>
                                    <p className="text-xs text-gray-500">{user.role}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
