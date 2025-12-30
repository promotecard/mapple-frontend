
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Student, UserWithPassword, SavedCard } from '../../../types';
import { useAppContext } from '../../../context/AppContext';
import { api } from '../../../services/mockApi';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Modal } from '../../ui/Modal';

interface FormData {
    firstName: string;
    lastName: string;
    suffix: string;
    avatarUrl: string;
    idNumber: string;
    email: string;
    phone: string;
    otherPhone: string;
    address: string;
    profession: string;
}

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

const SavedCardsSection: React.FC<{ cards: SavedCard[], onAdd: () => void, onRemove: (id: string) => void }> = ({ cards, onAdd, onRemove }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Mis Tarjetas Guardadas</h3>
                <Button type="button" size="sm" onClick={onAdd}>+ Agregar Tarjeta</Button>
            </div>
            {cards && cards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cards.map(card => (
                        <div key={card.id} className="border rounded-lg p-4 bg-gray-50 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-700">{card.brand} •••• {card.last4}</p>
                                <p className="text-sm text-gray-500">Expira: {card.expiryMonth}/{card.expiryYear}</p>
                                <p className="text-xs text-gray-400 mt-1">{card.holderName}</p>
                            </div>
                            <Button variant="danger" size="sm" onClick={() => onRemove(card.id)}>Eliminar</Button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-sm">No tienes tarjetas guardadas para pagos rápidos.</p>
            )}
        </div>
    );
};

const AddCardModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (cardData: any) => void }> = ({ isOpen, onClose, onSave }) => {
    const [holderName, setHolderName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate validation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const last4 = cardNumber.slice(-4);
        const [month, year] = expiry.split('/');
        
        onSave({
            holderName,
            last4,
            expiryMonth: month,
            expiryYear: year,
            brand: 'Visa' // Mocked brand detection
        });
        setIsProcessing(false);
        onClose();
        // Reset form
        setHolderName('');
        setCardNumber('');
        setExpiry('');
        setCvc('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Agregar Nueva Tarjeta">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label>Nombre del Titular</Label>
                    <Input value={holderName} onChange={e => setHolderName(e.target.value)} required placeholder="Como aparece en la tarjeta" />
                </div>
                <div>
                    <Label>Número de Tarjeta</Label>
                    <Input value={cardNumber} onChange={e => setCardNumber(e.target.value)} required placeholder="0000 0000 0000 0000" maxLength={19} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Expiración (MM/AA)</Label>
                        <Input value={expiry} onChange={e => setExpiry(e.target.value)} required placeholder="MM/AA" maxLength={5} />
                    </div>
                    <div>
                        <Label>CVC</Label>
                        <Input value={cvc} onChange={e => setCvc(e.target.value)} required placeholder="123" maxLength={4} />
                    </div>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isProcessing}>Cancelar</Button>
                    <Button type="submit" disabled={isProcessing}>{isProcessing ? 'Guardando...' : 'Guardar Tarjeta'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export const ParentProfileView: React.FC = () => {
    const { currentUser, login } = useAppContext();
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        firstName: '', lastName: '', suffix: '', avatarUrl: '',
        idNumber: '', email: '', phone: '', otherPhone: '', address: '', profession: ''
    });
    
    const [isAddCardOpen, setIsAddCardOpen] = useState(false);

    const parseName = (fullName: string = '') => {
        let mainName = fullName;
        let suffix = '';
        const suffixMatch = fullName.match(/\s\(.*\)/);
        if (suffixMatch) {
            suffix = suffixMatch[0];
            mainName = fullName.replace(suffix, '');
        }
        const parts = mainName.split(' ');
        const firstName = parts.shift() || '';
        const lastName = parts.join(' ');
        return { firstName, lastName, suffix };
    };
    
    const resetFormData = useCallback(() => {
        if (currentUser) {
            const { firstName, lastName, suffix } = parseName(currentUser.name);
            setFormData({
                firstName,
                lastName,
                suffix,
                avatarUrl: currentUser.avatarUrl || '',
                idNumber: currentUser.idNumber || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                otherPhone: currentUser.otherPhone || '',
                address: currentUser.address || '',
                profession: currentUser.profession || '',
            });
        }
    }, [currentUser]);

    useEffect(() => {
        resetFormData();
    }, [resetFormData]);

    const fetchStudents = useCallback(async () => {
        if (currentUser) {
            const studentsData = await api.getStudentsByParent(currentUser.id);
            setStudents(studentsData);
        }
    }, [currentUser]);

    useEffect(() => {
        setIsLoading(true);
        fetchStudents().finally(() => setIsLoading(false));
    }, [fetchStudents]);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handlePhotoUpload = async (file: File) => {
        const base64 = await fileToBase64(file);
        setFormData(prev => ({ ...prev, avatarUrl: base64 }));
    };

    const handleStudentPhotoUpload = async (studentId: string, file: File) => {
        try {
            const base64 = await fileToBase64(file);
            const studentToUpdate = students.find(s => s.id === studentId);
            if (studentToUpdate) {
                const updatedStudent = { ...studentToUpdate, avatarUrl: base64 };
                await api.updateStudentProfile(updatedStudent);
                fetchStudents();
            }
        } catch (error) {
            console.error("Failed to upload student photo:", error);
            alert("Error al subir la foto del estudiante.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setIsSaving(true);
        try {
            const updatedUser: UserWithPassword = {
                ...currentUser,
                name: `${formData.firstName} ${formData.lastName}${formData.suffix}`.trim(),
                avatarUrl: formData.avatarUrl,
                idNumber: formData.idNumber,
                email: formData.email,
                phone: formData.phone,
                otherPhone: formData.otherPhone,
                address: formData.address,
                profession: formData.profession,
            };
            await api.updateUser(updatedUser);
            login(currentUser.id); // Re-login to refresh context
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save profile:", error);
            alert("Error al guardar el perfil.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        resetFormData();
        setIsEditing(false);
    };
    
    const handleAddCard = async (cardData: any) => {
        if (!currentUser) return;
        await api.addSavedCard(currentUser.id, cardData);
        login(currentUser.id); // Refresh user data to see new card
    };

    const handleRemoveCard = async (cardId: string) => {
        if (!currentUser) return;
        if (window.confirm("¿Seguro que deseas eliminar esta tarjeta?")) {
            await api.removeSavedCard(currentUser.id, cardId);
            login(currentUser.id); // Refresh
        }
    };


    if (isLoading) return <div>Cargando perfil...</div>;
    if (!currentUser) return <div>No se pudo cargar la información del usuario.</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>

            <Card>
                <form onSubmit={handleSave}>
                    <CardHeader className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">Mi Información</h2>
                        {isEditing ? (
                            <div className="space-x-2">
                                <Button type="button" variant="secondary" onClick={handleCancel}>Cancelar</Button>
                                <Button type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</Button>
                            </div>
                        ) : (
                            <Button type="button" onClick={() => setIsEditing(true)}>Editar Perfil</Button>
                        )}
                    </CardHeader>
                    <CardContent>
                         {isEditing ? (
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <PhotoUpload imageUrl={formData.avatarUrl} onUpload={handlePhotoUpload} name={currentUser.name} />
                                </div>
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div><Label htmlFor="firstName">Nombres</Label><Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required/></div>
                                     <div><Label htmlFor="lastName">Apellidos</Label><Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required/></div>
                                     <div><Label htmlFor="idNumber">Cédula</Label><Input id="idNumber" name="idNumber" value={formData.idNumber} onChange={handleChange} /></div>
                                     <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required/></div>
                                     <div><Label htmlFor="phone">Teléfono</Label><Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} /></div>
                                     <div><Label htmlFor="otherPhone">Otro Teléfono</Label><Input id="otherPhone" name="otherPhone" type="tel" value={formData.otherPhone} onChange={handleChange} /></div>
                                     <div className="md:col-span-2"><Label htmlFor="address">Dirección</Label><Input id="address" name="address" value={formData.address} onChange={handleChange} /></div>
                                     <div className="md:col-span-2"><Label htmlFor="profession">Profesión / Ocupación</Label><Input id="profession" name="profession" value={formData.profession} onChange={handleChange} /></div>
                                </div>
                             </div>
                         ) : (
                             <div className="flex items-start space-x-6">
                                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-24 h-24 rounded-full object-cover bg-gray-200" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 flex-grow">
                                     <div><Label>Nombre Completo</Label><p className="text-gray-800">{currentUser.name}</p></div>
                                     <div><Label>Cédula</Label><p className="text-gray-800">{currentUser.idNumber || 'No especificado'}</p></div>
                                     <div><Label>Email</Label><p className="text-gray-800">{currentUser.email}</p></div>
                                     <div><Label>Teléfono</Label><p className="text-gray-800">{currentUser.phone || 'No especificado'}</p></div>
                                     <div><Label>Otro Teléfono</Label><p className="text-gray-800">{currentUser.otherPhone || 'No especificado'}</p></div>
                                     <div><Label>Dirección</Label><p className="text-gray-800">{currentUser.address || 'No especificado'}</p></div>
                                     <div className="md:col-span-2"><Label>Profesión / Ocupación</Label><p className="text-gray-800">{currentUser.profession || 'No especificado'}</p></div>
                                </div>
                             </div>
                         )}
                    </CardContent>
                </form>
            </Card>
            
            <Card>
                <CardContent className="p-6">
                    <SavedCardsSection 
                        cards={currentUser.savedCards || []} 
                        onAdd={() => setIsAddCardOpen(true)} 
                        onRemove={handleRemoveCard} 
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-800">Perfiles de Mis Hijos</h2>
                </CardHeader>
                <CardContent className="space-y-6">
                    {students.length > 0 ? (
                        students.map(student => (
                            <div key={student.id} className="p-4 border rounded-lg flex items-center space-x-4">
                                <img src={student.avatarUrl} alt={student.name} className="w-16 h-16 rounded-full object-cover"/>
                                <div className="flex-grow">
                                    <h3 className="font-semibold text-lg">{student.name}</h3>
                                    <p className="text-sm text-gray-500">{student.gradeLevel}</p>
                                </div>
                                <Button type="button" variant="secondary" onClick={() => document.getElementById(`student-photo-${student.id}`)?.click()}>
                                    Cambiar Foto
                                </Button>
                                <input type="file" id={`student-photo-${student.id}`} className="hidden" accept="image/*" onChange={(e) => e.target.files && handleStudentPhotoUpload(student.id, e.target.files[0])} />
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No tienes hijos vinculados a tu cuenta.</p>
                    )}
                </CardContent>
            </Card>
            
            <AddCardModal 
                isOpen={isAddCardOpen} 
                onClose={() => setIsAddCardOpen(false)} 
                onSave={handleAddCard} 
            />

        </div>
    );
};
