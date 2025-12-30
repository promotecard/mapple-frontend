
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { User } from '../../../types';
import { useAppContext } from '../../../context/AppContext';
import { api } from '../../../services/mockApi';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { ChangePinModal } from '../../forms/ChangePinModal';

const PhotoUpload: React.FC<{ imageUrl: string; onUpload: (file: File) => void; name: string; }> = ({ imageUrl, onUpload, name }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <img src={imageUrl} alt={name} className="w-24 h-24 rounded-full object-cover bg-gray-200" />
            <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>Cambiar Foto</Button>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
            />
        </div>
    );
};

export const ProfileView: React.FC = () => {
    const { currentUser, login } = useAppContext();
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    
    const [formData, setFormData] = useState<User | null>(currentUser);
    
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);

    const resetFormData = useCallback(() => {
        setFormData(currentUser);
    }, [currentUser]);

    useEffect(() => {
        resetFormData();
    }, [resetFormData]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData) return;
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handlePhotoUpload = async (file: File) => {
        if (!formData) return;
        const base64 = await fileToBase64(file);
        setFormData({ ...formData, avatarUrl: base64 });
    };

    const handleSave = async () => {
        if (!formData) return;
        setIsSaving(true);
        try {
            await api.updateUser(formData);
            await login(formData.id); // Refresh user in context
            setIsEditing(false);
            alert("Perfil actualizado correctamente.");
        } catch (error) {
            alert("Error al guardar los cambios.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        resetFormData();
        setIsEditing(false);
    };
    
    const handleSavePin = async (newPin: string) => {
        if (!currentUser) return;
        const updatedUser = { ...currentUser, pin: newPin };
        await api.updateUser(updatedUser);
        await login(currentUser.id);
        alert("¡El PIN ha sido cambiado correctamente!");
    };

    if (!currentUser || !formData) {
        return <p>Cargando información del perfil...</p>;
    }

    const renderProfileTab = () => (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <h3 className="font-semibold">Información de Perfil</h3>
                {isEditing ? (
                    <div className="space-x-2">
                        <Button variant="secondary" onClick={handleCancel}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar'}</Button>
                    </div>
                ) : <Button onClick={() => setIsEditing(true)}>Editar</Button>}
            </CardHeader>
            <CardContent className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        {isEditing ? <PhotoUpload imageUrl={formData.avatarUrl} onUpload={handlePhotoUpload} name={formData.name} /> : <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-24 h-24 rounded-full object-cover" />}
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Nombre</Label><Input name="name" value={formData.name} onChange={handleFormChange} readOnly={!isEditing} /></div>
                        <div><Label>Email</Label><Input name="email" value={formData.email} onChange={handleFormChange} readOnly={!isEditing} /></div>
                        <div className="md:col-span-2"><Label>Dirección de Entrega (Crédito Corporativo)</Label><Input name="address" value={formData.address || ''} onChange={handleFormChange} readOnly={!isEditing} /></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderSecurityTab = () => (
         <Card>
            <CardHeader><h3 className="font-semibold">Credenciales y Seguridad</h3></CardHeader>
            <CardContent className="space-y-8">
                <div>
                    <h4 className="font-medium text-gray-800">Cambiar Contraseña</h4>
                    <div className="mt-4 space-y-3 max-w-sm">
                        <div><Label>Contraseña Actual</Label><Input type="password" /></div>
                        <div><Label>Nueva Contraseña</Label><Input type="password" /></div>
                        <div><Label>Confirmar Nueva Contraseña</Label><Input type="password" /></div>
                        <Button onClick={() => alert("Funcionalidad de cambio de contraseña simulada.")}>Actualizar Contraseña</Button>
                    </div>
                </div>
                <div className="pt-6 border-t">
                    <h4 className="font-medium text-gray-800">PIN de Compra (POS)</h4>
                    <p className="text-sm text-gray-500 mt-1">Este PIN de 4 dígitos se usa para autorizar compras con su crédito corporativo en los puntos de venta.</p>
                    <div className="mt-4 flex items-center space-x-4">
                        <Input value="••••" readOnly className="w-24 font-mono text-center" />
                        <Button variant="secondary" onClick={() => setIsChangePinModalOpen(true)}>Cambiar PIN</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <>
            <div className="flex border-b border-gray-200 mb-6">
                <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Perfil</button>
                <button onClick={() => setActiveTab('security')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'security' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Seguridad</button>
            </div>

            {activeTab === 'profile' ? renderProfileTab() : renderSecurityTab()}

            <ChangePinModal 
                isOpen={isChangePinModalOpen}
                onClose={() => setIsChangePinModalOpen(false)}
                onSave={handleSavePin}
            />
        </>
    );
};
