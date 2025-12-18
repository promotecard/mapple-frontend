
import React, { useState } from 'react';
import type { Student } from '../../../types';
import { useAppContext } from '../../../context/AppContext';
import { api } from '../../../services/mockApi';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { ChangePinModal } from '../../forms/ChangePinModal';

interface StudentSettingsViewProps {
    student: Student;
}

export const StudentSettingsView: React.FC<StudentSettingsViewProps> = ({ student }) => {
    const { currentUser } = useAppContext();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('Las nuevas contraseñas no coinciden.');
            return;
        }
        if (newPassword.length < 6) {
            alert('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }
        // Simulation
        setIsSaving(true);
        setTimeout(() => {
            alert('Contraseña cambiada exitosamente (simulación).');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsSaving(false);
        }, 1000);
    };

    const handleSavePin = async (newPin: string) => {
        const updatedStudent = { ...student, pin: newPin };
        await api.updateStudentProfile(updatedStudent);
        alert("¡El PIN ha sido cambiado correctamente!");
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Configuración de la Cuenta</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><h2 className="text-xl font-semibold">Cambiar Contraseña</h2></CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <Label htmlFor="username">Usuario (Email)</Label>
                                <Input id="username" value={currentUser?.email || ''} readOnly disabled />
                            </div>
                            <div>
                                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                                <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                                <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                            </div>
                            <div className="text-right pt-2">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? 'Guardando...' : 'Cambiar Contraseña'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><h2 className="text-xl font-semibold">PIN de Compra</h2></CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <p className="text-gray-600 mb-4">Este PIN de 4 dígitos se usa para autorizar compras en la cafetería con tu saldo.</p>
                        <Input value="••••" readOnly className="w-24 font-mono text-center text-2xl tracking-widest mb-4" />
                        <Button variant="secondary" onClick={() => setIsChangePinModalOpen(true)}>
                            Cambiar PIN
                        </Button>
                    </CardContent>
                </Card>
            </div>
            
            <ChangePinModal 
                isOpen={isChangePinModalOpen}
                onClose={() => setIsChangePinModalOpen(false)}
                onSave={handleSavePin}
            />
        </div>
    );
};
