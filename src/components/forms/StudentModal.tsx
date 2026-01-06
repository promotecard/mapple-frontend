

import React, { useState, useEffect } from 'react';
import type { Classroom, GradeLevel } from '../../types';
import { api } from '../../services/mockApi';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { useAppContext } from '../../context/AppContext';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  classrooms: Classroom[];
  gradeLevels: GradeLevel[];
}

export const StudentModal: React.FC<StudentModalProps> = ({ isOpen, onClose, onSave, classrooms, gradeLevels }) => {
    const { currentUser } = useAppContext();
    const [name, setName] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [classroomId, setClassroomId] = useState('');
    const [parentCedula, setParentCedula] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const today = new Date().toISOString().split('T')[0];

    const resetForm = () => {
        setName('');
        setIdNumber('');
        setDateOfBirth('');
        setClassroomId('');
        setParentCedula('');
        setError(null);
    }

    const getGradeName = (gradeLevelId: string) => gradeLevels.find(gl => gl.id === gradeLevelId)?.name || 'Grado Desconocido';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!currentUser?.schoolId) {
            setError("Cannot create student without a school context.");
            setIsSubmitting(false);
            return;
        }

        try {
            let parentId = '';
            if (parentCedula) {
                const parents = await api.getParentsBySchool(currentUser.schoolId);
                const parent = parents.find(p => p.idNumber === parentCedula);
                if (parent) {
                    parentId = parent.id;
                } else {
                    setError(`No se encontró un padre/tutor con la cédula ${parentCedula}. Puede crear el estudiante sin vincular y hacerlo luego.`);
                }
            }
            
            // FIX: Derive 'gradeLevel' from the selected classroom and pass it to 'createStudent' to satisfy the function signature.
            const selectedClassroom = classrooms.find(c => c.id === classroomId);
            const gradeLevel = selectedClassroom ? getGradeName(selectedClassroom.gradeLevelId) : '';
            if (!gradeLevel) {
                setError("Could not find the grade level for the selected class.");
                setIsSubmitting(false);
                return;
            }
            
            await api.createStudent({
                name,
                idNumber,
                dateOfBirth,
                classroomId,
                parentId,
                schoolId: currentUser.schoolId,
                gradeLevel,
            });
            resetForm();
            onSave();
        } catch (err) {
            setError("Failed to create student.");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Crear Nuevo Estudiante (Perfil Básico)"
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Crear Estudiante'}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-md">
                    Está creando un perfil básico. El padre/tutor deberá completar el resto de la información desde su perfil.
                </p>
                {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="studentName">Nombre Completo</Label>
                        <Input id="studentName" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                     <div>
                        <Label htmlFor="studentIdNumber">Cédula / ID de Estudiante</Label>
                        <Input id="studentIdNumber" value={idNumber} onChange={e => setIdNumber(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                        <Input id="dateOfBirth" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required max={today} />
                    </div>
                    <div>
                        <Label htmlFor="classroomId">Grado a Cursar</Label>
                        <Select id="classroomId" value={classroomId} onChange={e => setClassroomId(e.target.value)} required>
                            <option value="">Seleccione un curso</option>
                            {classrooms.map(c => (
                                <option key={c.id} value={c.id}>
                                    {`${getGradeName(c.gradeLevelId)} - ${c.name} (${c.schoolYear})`}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="parentCedula">Cédula del Padre/Tutor (Opcional)</Label>
                        <Input id="parentCedula" value={parentCedula} onChange={e => setParentCedula(e.target.value)} placeholder="001-1234567-8" />
                        <p className="text-xs text-gray-500 mt-1">Si ingresa una cédula, el estudiante quedará vinculado a ese padre/tutor.</p>
                    </div>
                </div>
            </form>
        </Modal>
    );
};