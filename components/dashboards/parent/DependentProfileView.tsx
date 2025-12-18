import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Student, AuthorizedPickup } from '../../../types';
import { api } from '../../../services/mockApi';
import { Button } from '../../ui/Button';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Select } from '../../ui/Select';
import { Textarea } from '../../ui/Textarea';

interface DependentProfileViewProps {
  studentId: string;
  onBack: () => void;
}

type Tab = 'student' | 'family' | 'health' | 'development' | 'permissions';

const PhotoUpload: React.FC<{ imageUrl: string; onUpload: (file: File) => void; name: string; }> = ({ imageUrl, onUpload, name }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div className="flex items-center space-x-4">
            <img src={imageUrl} alt={name} className="w-20 h-20 rounded-full object-cover bg-gray-200" />
            <div>
                <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>Cambiar Foto</Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
};


export const DependentProfileView: React.FC<DependentProfileViewProps> = ({ studentId, onBack }) => {
    const [student, setStudent] = useState<Student | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('student');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const studentData = await api.getStudentById(studentId);
        if (studentData) {
            setStudent(studentData);
        }
        setIsLoading(false);
    }, [studentId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async () => {
        if (!student) return;
        setIsSaving(true);
        const updatedStudent = { ...student, profileStatus: 'Complete' as const };
        await api.updateStudentProfile(updatedStudent);
        setIsSaving(false);
        alert('Perfil del estudiante guardado con éxito.');
        onBack();
    };

    const handleNestedChange = (path: string, value: any) => {
        if (!student) return;
        setStudent(prev => {
            if (!prev) return null;
            const keys = path.split('.');
            const newState = JSON.parse(JSON.stringify(prev));
            let current: any = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newState;
        });
    };
    
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };
    
    const handleStudentPhotoUpload = async (file: File) => {
        if (!student) return;
        const base64 = await fileToBase64(file);
        handleNestedChange('avatarUrl', base64);
    };

    const handleAddPickup = () => {
        if (!student) return;
        const newPickup: AuthorizedPickup = { id: `pickup-${Date.now()}`, fullName: '', idNumber: '' };
        const updatedPickups = [...student.authorizedPickups, newPickup];
        handleNestedChange('authorizedPickups', updatedPickups);
    };

    const handleRemovePickup = (id: string) => {
        if (!student) return;
        const updatedPickups = student.authorizedPickups.filter(p => p.id !== id);
        handleNestedChange('authorizedPickups', updatedPickups);
    };

    const handlePickupChange = (id: string, field: 'fullName' | 'idNumber', value: string) => {
        if (!student) return;
        const updatedPickups = student.authorizedPickups.map(p => p.id === id ? { ...p, [field]: value } : p);
        handleNestedChange('authorizedPickups', updatedPickups);
    };

    if (isLoading) return <div>Cargando perfil del estudiante...</div>;
    if (!student) return <div>Estudiante no encontrado. <Button onClick={onBack}>Volver</Button></div>;

    const renderStudentData = () => (
      <CardContent className="space-y-6">
        <PhotoUpload imageUrl={student.avatarUrl} onUpload={handleStudentPhotoUpload} name={student.name}/>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div><Label>Nombre completo</Label><Input value={student.name} onChange={e => handleNestedChange('name', e.target.value)} /></div>
            <div><Label>Fecha de nacimiento</Label><Input type="date" value={student.dateOfBirth} onChange={e => handleNestedChange('dateOfBirth', e.target.value)} /></div>
            <div><Label>Nivel a cursar</Label><Input value={student.gradeLevel} disabled /></div>
            <div className="lg:col-span-3"><Label>Contactos de emergencia</Label><Textarea value={student.emergencyContacts} onChange={e => handleNestedChange('emergencyContacts', e.target.value)} /></div>
            <div className="lg:col-span-3"><Label>Estado de salud (resumen)</Label><Textarea value={student.healthSummary} onChange={e => handleNestedChange('healthSummary', e.target.value)} /></div>
        </div>
      </CardContent>
    );
    
    const renderFamilyInfo = () => (
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div><Label>Lugar de nacimiento</Label><Input value={student.familyInfo.birthplace} onChange={e => handleNestedChange('familyInfo.birthplace', e.target.value)} /></div>
        <div><Label>Dirección</Label><Input value={student.familyInfo.homeAddress} onChange={e => handleNestedChange('familyInfo.homeAddress', e.target.value)} /></div>
        <div><Label>Teléfono del hogar</Label><Input value={student.familyInfo.homePhone} onChange={e => handleNestedChange('familyInfo.homePhone', e.target.value)} /></div>
        <div><Label>Número de hermanos y edades</Label><Input value={student.familyInfo.siblings} onChange={e => handleNestedChange('familyInfo.siblings', e.target.value)} /></div>
        <div><Label>Posición del niño en la familia</Label><Input value={student.familyInfo.childPosition} onChange={e => handleNestedChange('familyInfo.childPosition', e.target.value)} /></div>
        <div><Label>Estado civil de los padres</Label><Select value={student.familyInfo.parentsMaritalStatus} onChange={e => handleNestedChange('familyInfo.parentsMaritalStatus', e.target.value)}><option value="married">Casados</option><option value="separated">Separados</option><option value="divorced">Divorciados</option><option value="other">Otro</option></Select></div>
        <div><Label>Con quién vive el niño</Label><Input value={student.familyInfo.livesWith} onChange={e => handleNestedChange('familyInfo.livesWith', e.target.value)} /></div>
        <div><Label>Tiempo que pasa la madre con el niño</Label><Input value={student.familyInfo.timeWithMother} onChange={e => handleNestedChange('familyInfo.timeWithMother', e.target.value)} /></div>
        <div><Label>Tiempo que pasa el padre con el niño</Label><Input value={student.familyInfo.timeWithFather} onChange={e => handleNestedChange('familyInfo.timeWithFather', e.target.value)} /></div>
      </CardContent>
    );
    
    const renderHealthHistory = () => (
      <CardContent>
          <h4 className="text-md font-semibold mb-3 border-b pb-2">Condiciones de Nacimiento</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center"><input type="checkbox" checked={student.healthHistory.birthConditions.breastfed} onChange={e => handleNestedChange('healthHistory.birthConditions.breastfed', e.target.checked)} className="mr-2"/> Lactancia materna</label>
              <label className="flex items-center"><input type="checkbox" checked={student.healthHistory.birthConditions.pacifier} onChange={e => handleNestedChange('healthHistory.birthConditions.pacifier', e.target.checked)} className="mr-2"/> Uso de chupete</label>
              <label className="flex items-center"><input type="checkbox" checked={student.healthHistory.birthConditions.bedWetting} onChange={e => handleNestedChange('healthHistory.birthConditions.bedWetting', e.target.checked)} className="mr-2"/> Se orina en la cama</label>
          </div>
          <h4 className="text-md font-semibold my-3 border-b pb-2">Salud General</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Nombre del pediatra</Label><Input value={student.healthHistory.general.pediatricianName} onChange={e => handleNestedChange('healthHistory.general.pediatricianName', e.target.value)} /></div>
              <div><Label>Contacto de emergencia</Label><Input value={student.healthHistory.general.emergencyContactName} onChange={e => handleNestedChange('healthHistory.general.emergencyContactName', e.target.value)} /></div>
              <div><Label>Alergias</Label><Textarea value={student.healthHistory.general.allergies} onChange={e => handleNestedChange('healthHistory.general.allergies', e.target.value)} /></div>
              <div><Label>Tratamientos actuales</Label><Textarea value={student.healthHistory.general.currentTreatments} onChange={e => handleNestedChange('healthHistory.general.currentTreatments', e.target.value)} /></div>
          </div>
      </CardContent>
    );
    
    const renderDevelopment = () => (
        <CardContent>
            <h4 className="text-md font-semibold mb-3 border-b pb-2">Área Emocional y Social</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Comportamiento frecuente</Label><Input value={student.developmentProfile.emotional.frequentBehavior} onChange={e => handleNestedChange('developmentProfile.emotional.frequentBehavior', e.target.value)} /></div>
                <div><Label>Juguetes preferidos</Label><Input value={student.developmentProfile.social.favoriteToys} onChange={e => handleNestedChange('developmentProfile.social.favoriteToys', e.target.value)} /></div>
            </div>
            <h4 className="text-md font-semibold my-3 border-b pb-2">Área Motora y del Lenguaje</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div><Label>Edad en que caminó</Label><Input value={student.developmentProfile.motor.walkedAge} onChange={e => handleNestedChange('developmentProfile.motor.walkedAge', e.target.value)} /></div>
                <div><Label>Edad en que empezó a hablar</Label><Input value={student.developmentProfile.language.spokeAge} onChange={e => handleNestedChange('developmentProfile.language.spokeAge', e.target.value)} /></div>
            </div>
        </CardContent>
    );

    const renderPermissions = () => (
        <CardContent>
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold">Personas autorizadas para recoger</h4>
                <Button variant="secondary" onClick={handleAddPickup}>+ Agregar Persona</Button>
            </div>
            <div className="space-y-3">
                {student.authorizedPickups.map(p => (
                    <div key={p.id} className="grid grid-cols-10 gap-2 items-center">
                        <div className="col-span-5"><Input placeholder="Nombre completo" value={p.fullName} onChange={e => handlePickupChange(p.id, 'fullName', e.target.value)} /></div>
                        <div className="col-span-4"><Input placeholder="Cédula" value={p.idNumber} onChange={e => handlePickupChange(p.id, 'idNumber', e.target.value)} /></div>
                        <div className="col-span-1"><Button variant="danger" onClick={() => handleRemovePickup(p.id)}>X</Button></div>
                    </div>
                ))}
            </div>
        </CardContent>
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Perfil de {student.name}</h1>
                <div className="flex space-x-2">
                    <Button variant="secondary" onClick={onBack}>&larr; Volver</Button>
                    <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex border-b border-gray-200">
                        <button onClick={() => setActiveTab('student')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'student' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Datos Generales</button>
                        <button onClick={() => setActiveTab('family')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'family' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Info Familiar</button>
                        <button onClick={() => setActiveTab('health')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'health' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Salud</button>
                        <button onClick={() => setActiveTab('development')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'development' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Desarrollo</button>
                        <button onClick={() => setActiveTab('permissions')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'permissions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Autorizaciones</button>
                    </div>
                </CardHeader>
                <div className="max-h-[65vh] overflow-y-auto">
                    {activeTab === 'student' && renderStudentData()}
                    {activeTab === 'family' && renderFamilyInfo()}
                    {activeTab === 'health' && renderHealthHistory()}
                    {activeTab === 'development' && renderDevelopment()}
                    {activeTab === 'permissions' && renderPermissions()}
                </div>
            </Card>
        </div>
    );
};