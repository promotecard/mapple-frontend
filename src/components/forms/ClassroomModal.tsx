import React, { useState, useEffect } from 'react';
import type { Classroom, GradeLevel, User, Student } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/mockApi';

interface ClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  classroom: Classroom | null;
  allGradeLevels: GradeLevel[];
  allStaff: User[];
  allStudents: Student[];
}

export const ClassroomModal: React.FC<ClassroomModalProps> = ({ 
    isOpen, onClose, onSave, classroom, allGradeLevels, allStaff, allStudents 
}) => {
    const { currentUser } = useAppContext();
    const [formData, setFormData] = useState<Omit<Classroom, 'id' | 'schoolId'>>({
        name: '',
        schoolYear: '2023-2024',
        gradeLevelId: '',
        teacherId: '',
        assistantId: '',
        studentIds: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [studentSearch, setStudentSearch] = useState('');

    const isEditing = !!classroom;

    useEffect(() => {
        if (classroom) {
            setFormData({
                name: classroom.name,
                schoolYear: classroom.schoolYear,
                gradeLevelId: classroom.gradeLevelId,
                teacherId: classroom.teacherId,
                assistantId: classroom.assistantId,
                studentIds: classroom.studentIds,
            });
        } else {
             setFormData({
                name: '',
                schoolYear: '2023-2024',
                gradeLevelId: allGradeLevels[0]?.id || '',
                teacherId: '',
                assistantId: '',
                studentIds: []
            });
        }
    }, [classroom, isOpen, allGradeLevels]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStudentMove = (studentId: string, direction: 'add' | 'remove') => {
        setFormData(prev => {
            if (direction === 'add') {
                return { ...prev, studentIds: [...prev.studentIds, studentId] };
            } else {
                return { ...prev, studentIds: prev.studentIds.filter(id => id !== studentId) };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.schoolId) return;

        setIsSubmitting(true);
        setError(null);
        
        try {
            if (isEditing && classroom) {
                await api.updateClassroom({ ...classroom, ...formData });
            } else {
                await api.createClassroom({ ...formData, schoolId: currentUser.schoolId });
            }
            onSave();
        } catch (err: any) {
            setError(err.message || 'Failed to save classroom.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const availableStudents = allStudents
        .filter(s => !formData.studentIds.includes(s.id) && (!s.classroomId || s.classroomId === classroom?.id))
        .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()));
        
    const enrolledStudents = allStudents.filter(s => formData.studentIds.includes(s.id));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Gestionar Curso/Aula' : 'Crear Nuevo Curso/Aula'}
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="gradeLevelId">Nivel de Grado</Label>
                        <Select id="gradeLevelId" name="gradeLevelId" value={formData.gradeLevelId} onChange={handleChange} required>
                            {allGradeLevels.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="name">Nombre del Curso/Aula</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Ej: Sección A" />
                    </div>
                    <div>
                        <Label htmlFor="schoolYear">Año Escolar</Label>
                        <Input id="schoolYear" name="schoolYear" value={formData.schoolYear} onChange={handleChange} required placeholder="Ej: 2024-2025" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                        <Label htmlFor="teacherId">Profesor(a) Principal</Label>
                        <Select id="teacherId" name="teacherId" value={formData.teacherId} onChange={handleChange}>
                            <option value="">Sin asignar</option>
                            {allStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="assistantId">Asistente</Label>
                        <Select id="assistantId" name="assistantId" value={formData.assistantId} onChange={handleChange}>
                            <option value="">Sin asignar</option>
                            {allStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <h4 className="font-semibold text-gray-800 mb-2">Lista de Estudiantes</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Disponibles</Label>
                            <Input placeholder="Buscar estudiante..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} className="mb-2" />
                            <div className="border rounded-md h-64 overflow-y-auto p-2 bg-gray-50">
                                {availableStudents.map(s => (
                                    <div key={s.id} className="flex items-center justify-between p-1.5 hover:bg-gray-100 rounded">
                                        <span className="text-sm">{s.name}</span>
                                        <button type="button" onClick={() => handleStudentMove(s.id, 'add')} className="text-blue-500 font-bold text-lg">&rarr;</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label>Inscritos ({enrolledStudents.length})</Label>
                            <div className="border rounded-md h-64 overflow-y-auto p-2 bg-white mt-[38px]">
                                {enrolledStudents.map(s => (
                                    <div key={s.id} className="flex items-center justify-between p-1.5 hover:bg-gray-100 rounded">
                                        <button type="button" onClick={() => handleStudentMove(s.id, 'remove')} className="text-red-500 font-bold text-lg">&larr;</button>
                                        <span className="text-sm">{s.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </form>
        </Modal>
    );
};
