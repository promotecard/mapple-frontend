
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import type { User, UserWithPassword, Position, Benefit } from '../../../types';
import { Permission, Status, Role } from '../../../types';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import { Select } from '../../ui/Select';
import { StaffModal } from '../../forms/StaffModal';
import { RoleModal } from '../../forms/RoleModal';
import { StaffCreditView } from './StaffCreditView';
import { Modal } from '../../ui/Modal';

const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>;

interface StaffMembersTabProps {
    positions: Position[];
    onUserEdit: (user: User) => void;
    benefits: Benefit[];
}


const StaffMembersTab: React.FC<StaffMembersTabProps> = ({ positions, onUserEdit, benefits }) => {
    const { currentUser, login } = useAppContext();
    const [staff, setStaff] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserWithPassword | null>(null);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    
    // Reset Password State
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resetUser, setResetUser] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');

    const fetchStaff = useCallback(async () => {
        if (currentUser?.schoolId) {
            const data = await api.getStaffBySchool(currentUser.schoolId);
            setStaff(data);
        }
    }, [currentUser?.schoolId]);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);
    
    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    }
    
    const handleCreate = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    }
    
    const handleSave = () => {
        fetchStaff();
        setIsModalOpen(false);
        setSelectedUser(null);
    }

    const handleToggleStatus = async (user: User) => {
        // Logic to determine the new status
        const currentStatus = user.status || Status.Active;
        const newStatus = currentStatus === Status.Suspended ? Status.Active : Status.Suspended;
        const actionText = currentStatus === Status.Suspended ? 'reactivar' : 'suspender';
        
        if (window.confirm(`¿Seguro que deseas ${actionText} a ${user.name}?`)) {
            setIsProcessing(user.id);
            try {
                // 1. Optimistic update: Update local state immediately so the UI reflects the change instantly
                setStaff(prevStaff => prevStaff.map(u => 
                    u.id === user.id ? { ...u, status: newStatus } : u
                ));

                // 2. Send update to API
                await api.updateUser({ ...user, status: newStatus });
                
                // 3. Fetch from server to ensure data consistency (backup)
                await fetchStaff();
            } catch (error) {
                console.error("Failed to update user status", error);
                alert("Error al actualizar el estado del usuario.");
                // Revert changes on error
                fetchStaff();
            } finally {
                setIsProcessing(null);
            }
        }
    };
    
    const handleResetPassword = async (user: User) => {
        if(window.confirm(`¿Generar nueva contraseña para ${user.name}?`)) {
            try {
                const newPass = await api.resetUserPassword(user.id);
                setResetUser(user);
                setNewPassword(newPass);
                setIsResetModalOpen(true);
            } catch (error) {
                alert("Error al resetear la contraseña.");
            }
        }
    };

    const filteredStaff = staff.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const userStatus = u.status || Status.Active;
        const matchesStatus = statusFilter === '' || userStatus === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const getPositionName = (id?: string) => positions.find(p => p.id === id)?.name || 'Sin cargo';

    const getStatusBadgeColor = (status?: string) => {
        const normalizedStatus = status || Status.Active;
        switch (normalizedStatus) {
            case Status.Suspended: return 'red';
            case Status.Pending: return 'yellow';
            case Status.Active: default: return 'green';
        }
    };

    return (
        <>
        
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                <div className="flex gap-4 flex-grow">
                    <Input
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                    <Select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-48"
                    >
                        <option value="">Todos los estados</option>
                        <option value={Status.Active}>Activo</option>
                        <option value={Status.Suspended}>Suspendido</option>
                        <option value={Status.Pending}>Pendiente</option>
                    </Select>
                </div>
                 <Button onClick={handleCreate}>+ Crear nuevo miembro</Button>
            </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStaff.map(user => {
                            const currentStatus = user.status || Status.Active;
                            const isSuspended = currentStatus === Status.Suspended;

                            return (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getPositionName(user.positionId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <Badge color={getStatusBadgeColor(currentStatus)}>
                                            {currentStatus}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            onClick={() => handleResetPassword(user)}
                                            title="Resetear Credenciales"
                                        >
                                            <KeyIcon />
                                        </Button>
                                        <Button 
                                            variant={isSuspended ? "primary" : "danger"} 
                                            size="sm" 
                                            onClick={() => handleToggleStatus(user)}
                                            disabled={isProcessing === user.id}
                                        >
                                            {isProcessing === user.id ? '...' : (isSuspended ? "Reactivar" : "Suspender")}
                                        </Button>
                                        <Button variant="secondary" className="text-xs" onClick={() => handleEdit(user)}>Editar</Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredStaff.length === 0 && (
                    <p className="text-center py-8 text-gray-500">No se encontraron miembros del personal con los filtros seleccionados.</p>
                )}
            </div>
        
        {isModalOpen && (
            <StaffModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                user={selectedUser}
                positions={positions}
                benefits={benefits}
            />
        )}

        {isResetModalOpen && resetUser && (
            <Modal 
                isOpen={isResetModalOpen} 
                onClose={() => setIsResetModalOpen(false)}
                title="Credenciales Reseteadas"
            >
                <div className="p-4 text-center">
                    <p className="mb-4 text-gray-600">La contraseña para <strong>{resetUser.name}</strong> ha sido reseteada.</p>
                    <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                        <p className="text-sm text-gray-500">Usuario: {resetUser.email}</p>
                        <p className="text-xl font-mono font-bold text-blue-800 mt-2">{newPassword}</p>
                    </div>
                    <p className="text-xs text-gray-500">Por favor comparta esta contraseña temporal con el usuario. Deberá cambiarla al ingresar.</p>
                    <Button onClick={() => setIsResetModalOpen(false)} className="mt-6">Entendido</Button>
                </div>
            </Modal>
        )}
        </>
    );
};

const RolesAndPermissionsTab: React.FC<{ positions: Position[], onPositionsUpdate: () => void, staff: User[] }> = ({ positions, onPositionsUpdate, staff }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Position | null>(null);

    const handleEdit = (role: Position) => {
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
        return staff.filter(user => user.positionId === positionId).length;
    };

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button onClick={handleCreate}>+ Crear nuevo cargo</Button>
            </div>
            <div className="space-y-4">
                {positions.map(pos => (
                    <div key={pos.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-start">
                       <div>
                            <h4 className="font-bold text-gray-800">{pos.name}</h4>
                            <p className="text-xs text-gray-500">{countUsersInRole(pos.id)} miembro(s)</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {pos.permissions.map(perm => <Badge key={perm} color="blue">{perm}</Badge>)}
                            </div>
                       </div>
                       <Button variant="secondary" className="text-xs" onClick={() => handleEdit(pos)}>Editar</Button>
                    </div>
                ))}
            </div>
        
        {isModalOpen && (
            <RoleModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                position={selectedRole}
            />
        )}
        </>
    );
};

interface StaffViewProps {}

export const StaffView: React.FC<StaffViewProps> = () => {
    const { currentUser } = useAppContext();
    const [activeTab, setActiveTab] = useState<'members' | 'roles' | 'credit'>('members');
    const [positions, setPositions] = useState<Position[]>([]);
    const [staff, setStaff] = useState<User[]>([]);
    const [benefits, setBenefits] = useState<Benefit[]>([]);

    const fetchData = useCallback(async () => {
        if(currentUser?.schoolId){
            const [positionsData, staffData, benefitsData] = await Promise.all([
                api.getPositions(currentUser.schoolId),
                api.getStaffBySchool(currentUser.schoolId),
                api.getBenefitsBySchool(currentUser.schoolId)
            ]);
            setPositions(positionsData);
            setStaff(staffData);
            setBenefits(benefitsData);
        }
    }, [currentUser?.schoolId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <Card>
            <CardHeader>
                <div className="flex border-b border-gray-200">
                    <button 
                        onClick={() => setActiveTab('members')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'members' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Miembros del Personal
                    </button>
                    <button 
                        onClick={() => setActiveTab('roles')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'roles' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Cargos y Permisos
                    </button>
                    <button 
                        onClick={() => setActiveTab('credit')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'credit' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Crédito Corporativo
                    </button>
                </div>
            </CardHeader>
            <CardContent>
                {activeTab === 'members' && <StaffMembersTab positions={positions} onUserEdit={() => {}} benefits={benefits} />}
                {activeTab === 'roles' && <RolesAndPermissionsTab positions={positions} onPositionsUpdate={fetchData} staff={staff} />}
                {activeTab === 'credit' && <StaffCreditView staff={staff} onUpdate={fetchData} />}
            </CardContent>
        </Card>
    );
};
