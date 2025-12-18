
import React, { useState, useEffect } from 'react';
import type { UserWithPassword, Student, GuardianInfo } from '../../types';
import { EmailTemplateType } from '../../types';
import { api } from '../../services/mockApi';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';

interface ParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  user: UserWithPassword | null;
}

const emptyGuardian: GuardianInfo = { fullName: '', profession: '', occupation: '', workplace: '', workPhone: '', cellPhone: '', email: '' };

export const ParentModal: React.FC<ParentModalProps> = ({ isOpen, onClose, onSave, user }) => {
    const { currentUser } = useAppContext();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [fatherInfo, setFatherInfo] = useState<GuardianInfo>(emptyGuardian);
    const [motherInfo, setMotherInfo] = useState<GuardianInfo>(emptyGuardian);
    
    // Student linking state
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [linkedStudentIds, setLinkedStudentIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Success / Email state
    const [view, setView] = useState<'form' | 'success'>('form');
    const [newUserData, setNewUserData] = useState<UserWithPassword | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
    const [emailPreviewContent, setEmailPreviewContent] = useState<{ to: string, subject: string, body: string } | null>(null);

    const isEditing = !!user;

    useEffect(() => {
        if (isOpen && currentUser?.schoolId) {
            // Fetch all students available for linking
            api.getStudentsBySchool(currentUser.schoolId).then(allSchoolStudents => {
                const availableStudents = allSchoolStudents.filter(s => !s.parentId || (isEditing && s.parentId === user?.id));
                setAllStudents(availableStudents);
            });
        }
        
        if (user) {
            // Split full name into parts for editing
            const nameParts = user.name.split(' ');
            const first = nameParts[0] || '';
            const last = nameParts.slice(1).join(' ') || '';

            setFirstName(first);
            setLastName(last);
            setEmail(user.email);
            setIdNumber(user.idNumber || '');
            setPhone(user.phone || '');
            setAddress(user.address || '');
            setFatherInfo(user.fatherInfo || emptyGuardian);
            setMotherInfo(user.motherInfo || emptyGuardian);

            // Fetch this parent's children
            api.getStudentsByParent(user.id).then(parentStudents => {
                setLinkedStudentIds(parentStudents.map(s => s.id));
            });
        } else {
            // Reset form for new parent
            setFirstName('');
            setLastName('');
            setEmail('');
            setIdNumber('');
            setPhone('');
            setAddress('');
            setFatherInfo(emptyGuardian);
            setMotherInfo(emptyGuardian);
            setLinkedStudentIds([]);
        }
        
        // Reset view state when modal opens
        setView('form');
        setNewUserData(null);
        setShowPassword(false);
        setIsEmailPreviewOpen(false);
        setEmailPreviewContent(null);
    }, [user, isOpen, currentUser?.schoolId, isEditing]);


    const handleGuardianChange = (guardian: 'father' | 'mother', e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const setter = guardian === 'father' ? setFatherInfo : setMotherInfo;
        setter(prev => ({ ...prev, [name]: value }));
    };

    const handleStudentLinkToggle = (studentId: string) => {
        setLinkedStudentIds(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!currentUser?.schoolId) return;

        // Email Validation
        if (!validateEmail(email)) {
            setError('El formato del correo electrónico es incorrecto. Por favor verifique.');
            setIsSubmitting(false);
            return;
        }

        const fullName = `${firstName} ${lastName}`.trim();

        try {
            if (isEditing) {
                const updatedUser: UserWithPassword = { 
                    ...user, 
                    name: fullName, 
                    email, idNumber, phone, address, fatherInfo, motherInfo
                };
                await api.updateUser(updatedUser);
                await api.updateStudentParentLinks(user.id, linkedStudentIds);
                onSave(); // Close immediately for edits
            } else {
                const { newUser } = await api.createParent({
                    name: fullName, 
                    email, idNumber, phone, address, fatherInfo, motherInfo, schoolId: currentUser.schoolId
                });
                await api.updateStudentParentLinks(newUser.id, linkedStudentIds);
                setNewUserData(newUser);
                setView('success'); // Switch to success view for new users
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleClose = () => {
        onSave(); // Ensure parent component refreshes data
        onClose();
    };

    const handleSendEmail = async () => {
        if(!newUserData || !currentUser) return;
        
        try {
          const templates = await api.getEmailTemplates();
          const credentialTemplate = templates.find(t => t.type === EmailTemplateType.NewParentCredentials);
          
          if (credentialTemplate) {
              let subject = credentialTemplate.subject;
              let body = credentialTemplate.body;
              
              // Get school name
              const schools = await api.getSchools();
              const mySchool = schools.find(s => s.id === currentUser.schoolId);
              const schoolName = mySchool?.name || 'Su Colegio';
  
              const replacements = {
                  '{{parentName}}': newUserData.name,
                  '{{schoolName}}': schoolName,
                  '{{email}}': newUserData.email,
                  '{{password}}': newUserData.password || '',
              };
  
              Object.entries(replacements).forEach(([key, value]) => {
                  subject = subject.replace(new RegExp(key, 'g'), value);
                  body = body.replace(new RegExp(key, 'g'), value);
              });
              
              setEmailPreviewContent({
                  to: newUserData.email,
                  subject: subject,
                  body: body,
              });
              setIsEmailPreviewOpen(true);
          } else {
              alert("No se encontró la plantilla de correo para credenciales de padres.");
          }
        } catch (error) {
            alert("Error al cargar las plantillas de correo.");
        }
    };
    
    const filteredStudents = allStudents.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.idNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderForm = () => (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Editar Padre/Madre/Tutor' : 'Crear Padre/Madre/Tutor'}
            closeOnOverlayClick={false}
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md border border-red-200 font-medium">{error}</div>}
                
                <h3 className="text-lg font-semibold border-b pb-2">Información del Contacto Principal</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Nombres</Label>
                        <Input 
                            value={firstName} 
                            onChange={e => setFirstName(e.target.value)} 
                            required 
                            placeholder="Ej: Juan Carlos"
                        />
                    </div>
                    <div>
                        <Label>Apellidos</Label>
                        <Input 
                            value={lastName} 
                            onChange={e => setLastName(e.target.value)} 
                            required 
                            placeholder="Ej: Pérez Rodríguez"
                        />
                    </div>
                    <div>
                        <Label>Cédula</Label>
                        <Input value={idNumber} onChange={e => setIdNumber(e.target.value)} />
                    </div>
                    <div>
                        <Label>Email</Label>
                        <Input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                            placeholder="ejemplo@correo.com"
                        />
                    </div>
                    <div><Label>Teléfono</Label><Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></div>
                    <div className="md:col-span-2"><Label>Dirección</Label><Input value={address} onChange={e => setAddress(e.target.value)} /></div>
                </div>

                <h3 className="text-lg font-semibold border-b pb-2 pt-4">Información del Padre</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Nombre Completo</Label><Input name="fullName" value={fatherInfo.fullName} onChange={e => handleGuardianChange('father', e)} /></div>
                    <div><Label>Profesión</Label><Input name="profession" value={fatherInfo.profession} onChange={e => handleGuardianChange('father', e)} /></div>
                    <div><Label>Lugar de Trabajo</Label><Input name="workplace" value={fatherInfo.workplace} onChange={e => handleGuardianChange('father', e)} /></div>
                    <div><Label>Teléfono Trabajo</Label><Input name="workPhone" value={fatherInfo.workPhone} onChange={e => handleGuardianChange('father', e)} /></div>
                </div>

                <h3 className="text-lg font-semibold border-b pb-2 pt-4">Información de la Madre</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Nombre Completo</Label><Input name="fullName" value={motherInfo.fullName} onChange={e => handleGuardianChange('mother', e)} /></div>
                    <div><Label>Profesión</Label><Input name="profession" value={motherInfo.profession} onChange={e => handleGuardianChange('mother', e)} /></div>
                    <div><Label>Lugar de Trabajo</Label><Input name="workplace" value={motherInfo.workplace} onChange={e => handleGuardianChange('mother', e)} /></div>
                    <div><Label>Teléfono Trabajo</Label><Input name="workPhone" value={motherInfo.workPhone} onChange={e => handleGuardianChange('mother', e)} /></div>
                </div>

                <div className="pt-4 border-t">
                    <Label>Vincular Estudiantes (Dependientes)</Label>
                     <Input 
                        placeholder="Buscar por nombre o cédula del estudiante..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="my-2"
                    />
                    {allStudents.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded">
                            {filteredStudents.map(student => (
                                <label key={student.id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={linkedStudentIds.includes(student.id)}
                                        onChange={() => handleStudentLinkToggle(student.id)}
                                        className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                    <span className="text-sm">{student.name}</span>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 mt-1">No hay estudiantes disponibles para vincular. Créelos primero.</p>
                    )}
                </div>
            </form>
        </Modal>
    );

    const renderSuccess = () => (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Padre Creado Exitosamente"
            closeOnOverlayClick={false}
            footer={<Button onClick={handleClose}>Finalizar</Button>}
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
                <h4 className="font-semibold text-gray-800">Credenciales de Acceso</h4>
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
