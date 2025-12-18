
import React, { useState, useEffect } from 'react';
import type { UserWithPassword, Position, Benefit } from '../../types';
import { Role, EmailTemplateType } from '../../types';
import { api } from '../../services/mockApi';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  user: UserWithPassword | null;
  positions: Position[];
  benefits: Benefit[];
}

export const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, onSave, user, positions, benefits }) => {
    const { currentUser } = useAppContext();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        positionId: '',
        benefitId: '',
        creditLimit: 0,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [view, setView] = useState<'form' | 'success'>('form');
    const [newUserData, setNewUserData] = useState<UserWithPassword | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
    const [emailPreviewContent, setEmailPreviewContent] = useState<{ to: string, subject: string, body: string } | null>(null);
    
    const isEditing = !!user;

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                positionId: user.positionId || '',
                benefitId: user.benefitId || '',
                creditLimit: user.creditLimit || 0,
            });
        } else {
            setFormData({
                name: '',
                email: '',
                positionId: '',
                benefitId: '',
                creditLimit: 0,
            });
        }
        setView('form');
        setNewUserData(null);
        setIsEmailPreviewOpen(false);
        setEmailPreviewContent(null);
    }, [user, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        if (!currentUser?.schoolId) {
            setError("Current user is not associated with a school.");
            setIsSubmitting(false);
            return;
        }

        try {
            if (isEditing && user) {
                const updatedUser = { ...user, ...formData, creditLimit: Number(formData.creditLimit) };
                await api.updateUser(updatedUser);
                onSave();
            } else {
                const { newUser } = await api.createUser({ 
                    ...formData,
                    creditLimit: Number(formData.creditLimit),
                    schoolId: currentUser.schoolId, 
                    role: Role.Teacher 
                });
                setNewUserData(newUser);
                setView('success');
                return; 
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleClose = () => {
      setFormData({ name: '', email: '', positionId: '', benefitId: '', creditLimit: 0 });
      setError(null);
      setView('form');
      setNewUserData(null);
      setShowPassword(false);
      setIsEmailPreviewOpen(false);
      setEmailPreviewContent(null);
      onClose();
    }

    const handleSendEmail = async () => {
        if (!newUserData || !currentUser?.schoolId) return;
        
        try {
            const schools = await api.getSchools();
            const mySchool = schools.find(s => s.id === currentUser.schoolId);
            const schoolName = mySchool?.name || 'El Colegio';

            // Create standard content directly to ensure it works, can be enhanced with templates later
            const subject = `Credenciales de Acceso - ${schoolName}`;
            const body = `Hola ${newUserData.name},\n\nBienvenido al equipo de ${schoolName}. Se ha creado tu cuenta de personal en Mapple School.\n\nAquí tienes tus credenciales de acceso:\n\nUsuario: ${newUserData.email}\nContraseña: ${newUserData.password}\n\nPor favor, ingresa al sistema y cambia tu contraseña lo antes posible.\n\nAtentamente,\nLa Administración`;

            setEmailPreviewContent({
                to: newUserData.email,
                subject: subject,
                body: body,
            });
            setIsEmailPreviewOpen(true);
        } catch (error) {
            console.error("Error preparing email", error);
            alert("Error al preparar el correo.");
        }
    };

    const renderForm = () => (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEditing ? 'Editar Miembro del Personal' : 'Crear Miembro del Personal'}
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">Nombre Completo</Label>
                        <Input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="positionId">Cargo</Label>
                        <Select name="positionId" id="positionId" value={formData.positionId || ''} onChange={handleChange} required>
                            <option value="" disabled>-- Seleccione un cargo --</option>
                            {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </Select>
                    </div>
                    <div className="pt-4 border-t md:col-span-2">
                        <h4 className="font-semibold text-gray-700">Configuración de Crédito Corporativo</h4>
                    </div>
                    <div>
                        <Label htmlFor="benefitId">Beneficio / Subsidio Asignado</Label>
                        <Select name="benefitId" id="benefitId" value={formData.benefitId || ''} onChange={handleChange}>
                            <option value="">-- Sin Beneficio --</option>
                            {benefits.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </Select>
                    </div>
                     <div>
                        <Label htmlFor="creditLimit">Límite de Crédito ($)</Label>
                        <Input type="number" name="creditLimit" id="creditLimit" value={formData.creditLimit} onChange={handleChange} min="0" />
                    </div>
                </div>
            </form>
        </Modal>
    );

     const renderSuccess = () => (
        <Modal
            isOpen={isOpen}
            onClose={() => { onSave(); handleClose(); }}
            title="Usuario Creado Exitosamente"
            footer={<Button onClick={() => { onSave(); handleClose(); }}>Finalizar</Button>}
        >
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="mt-3 text-lg leading-6 font-medium text-gray-900">¡Éxito!</h3>
                <p className="mt-2 px-7 py-3 text-sm text-gray-500">
                    Se ha creado la cuenta de usuario para "{newUserData?.name}".
                </p>
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-gray-800">Credenciales del Nuevo Usuario</h4>
                <div>
                    <Label>Email / Usuario</Label>
                    <p className="text-sm text-gray-700 p-2 bg-white rounded-md">{newUserData?.email}</p>
                </div>
                <div>
                    <Label>Contraseña Temporal</Label>
                    <div className="flex items-center space-x-2">
                        <input 
                            type={showPassword ? 'text' : 'password'}
                            readOnly
                            value={newUserData?.password}
                            className="flex-grow w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-white font-mono"
                        />
                        <button onClick={() => setShowPassword(!showPassword)} className="p-2 text-gray-500 hover:text-gray-700">
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 flex justify-center">
                <Button variant="secondary" onClick={handleSendEmail}>
                    <MailIcon />
                    <span className="ml-2">Enviar Credenciales por Email</span>
                </Button>
            </div>
        </Modal>
    );

  return (
    <>
        {view === 'form' ? renderForm() : renderSuccess()}
        
        {emailPreviewContent && (
            <Modal
                isOpen={isEmailPreviewOpen}
                onClose={() => setIsEmailPreviewOpen(false)}
                title="Vista Previa del Correo"
                footer={<Button onClick={() => setIsEmailPreviewOpen(false)}>Cerrar</Button>}
            >
                <div className="space-y-4">
                    <div className="flex items-center p-3 bg-green-100 border border-green-200 rounded-md">
                        <svg className="h-6 w-6 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <p className="text-sm font-medium text-green-800">Para fines de demostración, este correo se ha generado y mostrado aquí en lugar de enviarse.</p>
                    </div>
                    <div>
                        <Label>Para:</Label>
                        <p className="text-sm p-2 bg-gray-100 rounded-md">{emailPreviewContent.to}</p>
                    </div>
                    <div>
                        <Label>Asunto:</Label>
                        <p className="text-sm p-2 bg-gray-100 rounded-md">{emailPreviewContent.subject}</p>
                    </div>
                    <div>
                        <Label>Cuerpo:</Label>
                        <pre className="text-sm p-4 bg-gray-100 rounded-md whitespace-pre-wrap font-sans">
                            {emailPreviewContent.body}
                        </pre>
                    </div>
                </div>
            </Modal>
        )}
    </>
  );
};


const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
