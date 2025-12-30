
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { User, Provider } from '../../../types';
import { ProviderPermission } from '../../../types';
import { useAppContext } from '../../../context/AppContext';
import { api } from '../../../services/mockApi';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { countries, citiesByCountry } from '../../../services/mockApi';
import { Select } from '../../ui/Select';
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
    const { currentUser, permissions, login } = useAppContext();
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    
    const [provider, setProvider] = useState<Provider | null>(null);
    const [user, setUser] = useState(currentUser);
    
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);

    const hasPOSPermission = permissions.includes(ProviderPermission.UsePOS);

    const fetchData = useCallback(async () => {
        if (currentUser?.providerId) {
            const providerData = await api.getProviderById(currentUser.providerId);
            setProvider(providerData || null);
        }
        setUser(currentUser);
    }, [currentUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!user) return;
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleProviderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!provider) return;
        const { name, value } = e.target;
        if (name === 'country') {
            setProvider({ ...provider, country: value, city: '' });
        } else {
            setProvider({ ...provider, [name]: value });
        }
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
        if (!user) return;
        const base64 = await fileToBase64(file);
        setUser({ ...user, avatarUrl: base64 });
    };

    const handleSave = async () => {
        if (!user || !provider) return;
        setIsSaving(true);
        try {
            await api.updateUser(user);
            await api.updateProvider(provider);
            await login(user.id); // Refresh user in context
            setIsEditing(false);
            alert('Perfil actualizado correctamente.');
        } catch (error) {
            alert("Error al guardar los cambios.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleSavePin = async (newPin: string) => {
        if (!user) return;
        const updatedUser = { ...user, pin: newPin };
        await api.updateUser(updatedUser);
        await login(user.id);
        alert("¡El PIN ha sido cambiado correctamente!");
    };

    if (!provider || !user) {
        return <p>Cargando información del perfil...</p>;
    }

    const renderProfileTab = () => (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <h3 className="font-semibold">Información de Perfil</h3>
                {isEditing ? (
                    <div className="space-x-2">
                        <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar'}</Button>
                    </div>
                ) : <Button onClick={() => setIsEditing(true)}>Editar</Button>}
            </CardHeader>
            <CardContent className="space-y-8">
                <div>
                    <h4 className="font-medium text-gray-800 border-b pb-2 mb-4">Mi Usuario</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">{isEditing ? <PhotoUpload imageUrl={user.avatarUrl} onUpload={handlePhotoUpload} name={user.name} /> : <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full object-cover" />}</div>
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label>Nombre</Label><Input name="name" value={user.name} onChange={handleUserChange} readOnly={!isEditing} /></div>
                            <div><Label>Email</Label><Input name="email" value={user.email} onChange={handleUserChange} readOnly={!isEditing} /></div>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="font-medium text-gray-800 border-b pb-2 mb-4">Información del Negocio</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Nombre del Negocio</Label><Input name="businessName" value={provider.businessName} onChange={handleProviderChange} readOnly={!isEditing} /></div>
                        <div><Label>RNC / Tax ID</Label><Input name="taxId" value={provider.taxId} onChange={handleProviderChange} readOnly={!isEditing} /></div>
                        <div><Label>Nombre de Contacto</Label><Input name="contactName" value={provider.contactName} onChange={handleProviderChange} readOnly={!isEditing} /></div>
                        <div><Label>Email del Negocio</Label><Input name="email" value={provider.email} onChange={handleProviderChange} readOnly={!isEditing} /></div>
                        <div><Label>País</Label><Select name="country" value={provider.country} onChange={handleProviderChange} disabled={!isEditing}>{countries.map(c=><option key={c} value={c}>{c}</option>)}</Select></div>
                        <div><Label>Ciudad</Label><Select name="city" value={provider.city} onChange={handleProviderChange} disabled={!isEditing || !provider.country}>{(citiesByCountry[provider.country] || []).map(c=><option key={c} value={c}>{c}</option>)}</Select></div>
                        <div className="md:col-span-2"><Label>Dirección</Label><Input name="address" value={provider.address} onChange={handleProviderChange} readOnly={!isEditing} /></div>
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
                 {hasPOSPermission && (
                    <div className="pt-6 border-t">
                        <h4 className="font-medium text-gray-800">PIN de Compra (POS)</h4>
                        <p className="text-sm text-gray-500 mt-1">Este PIN de 4 dígitos se usa para autorizar compras con su crédito corporativo en los puntos de venta.</p>
                        <div className="mt-4 flex items-center space-x-4">
                            <Input value="••••" readOnly className="w-24 font-mono text-center" />
                            <Button variant="secondary" onClick={() => setIsChangePinModalOpen(true)}>Cambiar PIN</Button>
                        </div>
                    </div>
                 )}
            </CardContent>
        </Card>
    );

    return (
        <>
            <div className="flex border-b border-gray-200 mb-6">
                <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Información de Perfil</button>
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
