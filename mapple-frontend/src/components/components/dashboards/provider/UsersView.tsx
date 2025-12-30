import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import type { User, UserWithPassword, ProviderPosition } from '../../../types';
import { ProviderPermission } from '../../../types';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import { ProviderUserModal } from '../../forms/ProviderUserModal';
import { ProviderRoleModal } from '../../forms/ProviderRoleModal';

const MembersTab: React.FC<{ positions: ProviderPosition[], onUserUpdate: () => void }> = ({ positions, onUserUpdate }) => {
    const { currentUser } = useAppContext();
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserWithPassword | null>(null);

    const fetchUsers = useCallback(async () => {
        if (currentUser?.providerId) {
            const data = await api.getUsersByProvider(currentUser.providerId);
            setUsers(data);
        }
    }, [currentUser?.providerId]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    }
    
    const handleCreate = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    }
    
    const handleSave = () => {
        fetchUsers();
        onUserUpdate();
        setIsModalOpen(false);
        setSelectedUser(null);
    }

    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const getPositionName = (id?: string) => positions.find(p => p.id === id)?.name || 'Sin cargo';

    return (
        <>
        <Card>
            <CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h3 className="text-lg font-semibold">Miembros del Equipo</h3>
                 <Button onClick={handleCreate}>+ Crear Nuevo Usuario</Button>
            </CardHeader>
            <CardContent>
                <Input
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4"
                />
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getPositionName(user.positionId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button variant="secondary" className="text-xs" onClick={() => handleEdit(user)}>Editar</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
        {isModalOpen && (
            <ProviderUserModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                user={selectedUser}
                positions={positions}
            />
        )}
        </>
    );
};

const RolesTab: React.FC<{ positions: ProviderPosition[], onPositionsUpdate: () => void, users: User[] }> = ({ positions, onPositionsUpdate, users }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<ProviderPosition | null>(null);

    const handleEdit = (role: ProviderPosition) => {
        setSelectedRole(role);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedRole(null);
        setIsModalOpen(true);
    };
    
    const handleSave = () => {
        onPositionsUpdate();
        setIsModalOpen(false);
        setSelectedRole(null);
    }

    const countUsersInRole = (positionId: string) => {
        return users.filter(user => user.positionId === positionId).length;
    };

    return (
        <>
        <Card>
            <CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h3 className="text-lg font-semibold">Cargos y Permisos</h3>
                <Button onClick={handleCreate}>+ Crear Nuevo Cargo</Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {positions.map(pos => (
                        <div key={pos.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-start">
                           <div>
                                <h4 className="font-bold text-gray-800">{pos.name}</h4>
                                <p className="text-xs text-gray-500">{countUsersInRole(pos.id)} miembro(s)</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {pos.permissions.map(perm => <Badge key={perm} color="blue">{perm.replace(/([A-Z])/g, ' $1').trim()}</Badge>)}
                                </div>
                           </div>
                           <Button variant="secondary" className="text-xs" onClick={() => handleEdit(pos)}>Editar</Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
        {isModalOpen && (
            <ProviderRoleModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                position={selectedRole}
            />
        )}
        </>
    );
};


export const UsersView: React.FC = () => {
    const { currentUser } = useAppContext();
    const [activeTab, setActiveTab] = useState<'members' | 'roles'>('members');
    const [positions, setPositions] = useState<ProviderPosition[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    const fetchData = useCallback(async () => {
        if(currentUser?.providerId){
            const [positionsData, usersData] = await Promise.all([
                api.getProviderPositions(currentUser.providerId),
                api.getUsersByProvider(currentUser.providerId)
            ]);
            setPositions(positionsData);
            setUsers(usersData);
        }
    }, [currentUser?.providerId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="space-y-4">
            <div className="flex border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('members')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'members' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Miembros del Equipo
                </button>
                <button 
                    onClick={() => setActiveTab('roles')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'roles' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Cargos y Permisos
                </button>
            </div>
            {activeTab === 'members' 
                ? <MembersTab positions={positions} onUserUpdate={fetchData} /> 
                : <RolesTab positions={positions} onPositionsUpdate={fetchData} users={users} />
            }
        </div>
    );
};