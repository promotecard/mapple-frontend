import React, { useState, useEffect } from 'react';
import type { Classroom, Student } from '../../types';
import { Modal } from '../ui/Modal';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { api } from '../../services/mockApi';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  fromClassroom: Classroom;
  allClassrooms: Classroom[];
  allStudents: Student[];
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ 
    isOpen, onClose, onSave, fromClassroom, allClassrooms, allStudents 
}) => {
    const [studentsToPromote, setStudentsToPromote] = useState<string[]>([]);
    const [targetClassroomId, setTargetClassroomId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentStudents = allStudents.filter(s => fromClassroom.studentIds.includes(s.id));
    const nextSchoolYear = (parseInt(fromClassroom.schoolYear.split('-')[0]) + 1) + '-' + (parseInt(fromClassroom.schoolYear.split('-')[1]) + 1);
    const availableTargetClassrooms = allClassrooms.filter(c => c.schoolYear === nextSchoolYear && c.id !== fromClassroom.id);
    
    useEffect(() => {
        if (isOpen) {
            // By default, all students in the class are selected for promotion
            setStudentsToPromote(fromClassroom.studentIds);
            setTargetClassroomId('');
            setError(null);
        }
    }, [isOpen, fromClassroom]);

    const handleStudentToggle = (studentId: string) => {
        setStudentsToPromote(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleSubmit = async () => {
        if (!targetClassroomId) {
            setError("Por favor, seleccione un curso de destino.");
            return;
        }
        if (studentsToPromote.length === 0) {
            setError("Por favor, seleccione al menos un estudiante para promover.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await api.promoteStudents(fromClassroom.id, targetClassroomId, studentsToPromote);
            onSave();
        } catch (err: any) {
            setError(err.message || "Error al promover estudiantes.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Promover Estudiantes de ${fromClassroom.name} (${fromClassroom.schoolYear})`}
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Promoviendo...' : `Promover ${studentsToPromote.length} Estudiante(s)`}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}
                
                <div>
                    <Label>1. Seleccione los estudiantes a promover</Label>
                    <p className="text-xs text-gray-500 mb-2">Deseleccione los estudiantes que no pasarán al siguiente curso.</p>
                    <div className="border rounded-md max-h-60 overflow-y-auto p-2 bg-gray-50">
                        {currentStudents.map(s => (
                            <label key={s.id} className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={studentsToPromote.includes(s.id)}
                                    onChange={() => handleStudentToggle(s.id)}
                                    className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <span className="text-sm">{s.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <Label htmlFor="targetClassroom">2. Seleccione el curso de destino para el año {nextSchoolYear}</Label>
                    <Select id="targetClassroom" value={targetClassroomId} onChange={e => setTargetClassroomId(e.target.value)} required>
                        <option value="">-- Seleccionar curso --</option>
                        {availableTargetClassrooms.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </Select>
                </div>

            </div>
        </Modal>
    );
};
