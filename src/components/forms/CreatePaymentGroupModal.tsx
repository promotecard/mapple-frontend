
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { api } from '../../services/mockApi';
import { useAppContext } from '../../context/AppContext';
import type { RecurringPayment, GradeLevel, Student, User, PaymentGroup } from '../../types';

interface CreatePaymentGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export const CreatePaymentGroupModal: React.FC<CreatePaymentGroupModalProps> = ({ isOpen, onClose, onSave }) => {
    const { currentUser } = useAppContext();
    const [name, setName] = useState('');
    const [recurringPaymentId, setRecurringPaymentId] = useState('');
    const [dueDate, setDueDate] = useState('');
    
    const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
    const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [parents, setParents] = useState<User[]>([]);
    
    // Selection Logic State
    const [selectionMode, setSelectionMode] = useState<'grade' | 'manual'>('grade');
    const [selectedGradeId, setSelectedGradeId] = useState('');
    const [selectedParentIds, setSelectedParentIds] = useState<string[]>([]);
    const [parentSearchTerm, setParentSearchTerm] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && currentUser?.schoolId) {
            const fetch = async () => {
                const [rps, grades, stus, prnts] = await Promise.all([
                    api.getRecurringPayments(currentUser.schoolId!),
                    api.getGradeLevelsBySchool(currentUser.schoolId!),
                    api.getStudentsBySchool(currentUser.schoolId!),
                    api.getParentsBySchool(currentUser.schoolId!)
                ]);
                setRecurringPayments(rps);
                setGradeLevels(grades);
                setStudents(stus);
                setParents(prnts);
                
                // Default due date to next month 1st
                const now = new Date();
                const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                setDueDate(nextMonth.toISOString().split('T')[0]);
            };
            fetch();
        } else {
            // Reset
            setName('');
            setRecurringPaymentId('');
            setSelectedGradeId('');
            setSelectedParentIds([]);
            setSelectionMode('grade');
            setParentSearchTerm('');
        }
    }, [isOpen, currentUser]);

    const handleModeChange = (mode: 'grade' | 'manual') => {
        setSelectionMode(mode);
        // Clear selections when switching modes to avoid confusion
        setSelectedGradeId('');
        setSelectedParentIds([]);
    };

    const handleGradeSelection = (gradeId: string) => {
        setSelectedGradeId(gradeId);
        if (gradeId) {
            const gradeName = gradeLevels.find(g => g.id === gradeId)?.name;
            if (gradeName) {
                const studentsInGrade = students.filter(s => s.gradeLevel === gradeName);
                const parentIds = studentsInGrade.map(s => s.parentId).filter(Boolean);
                setSelectedParentIds([...new Set(parentIds)]);
            }
        } else {
            setSelectedParentIds([]);
        }
    };

    const handleManualParentToggle = (parentId: string) => {
        setSelectedParentIds(prev => 
            prev.includes(parentId) 
                ? prev.filter(id => id !== parentId)
                : [...prev, parentId]
        );
    };

    const handleSave = async () => {
        if (!name || !recurringPaymentId || !dueDate || selectedParentIds.length === 0 || !currentUser?.schoolId) {
            alert("Por favor complete todos los campos y asegúrese de que haya padres seleccionados.");
            return;
        }

        setIsSubmitting(true);
        try {
            const newGroup: Omit<PaymentGroup, 'id'> = {
                schoolId: currentUser.schoolId,
                name,
                recurringPaymentId,
                memberParentIds: selectedParentIds,
                nextDueDate: dueDate
            };
            await api.createPaymentGroup(newGroup);
            onSave();
            onClose();
        } catch (e) {
            alert("Error al crear el grupo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredParents = parents.filter(p => p.name.toLowerCase().includes(parentSearchTerm.toLowerCase()));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Crear Grupo de Pago Recurrente">
            <div className="space-y-4">
                <div>
                    <Label>Nombre del Grupo</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Mensualidad 2024 - 1ro Primaria" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Concepto de Pago</Label>
                        <Select value={recurringPaymentId} onChange={e => setRecurringPaymentId(e.target.value)}>
                            <option value="">Seleccionar...</option>
                            {recurringPayments.map(rp => (
                                <option key={rp.id} value={rp.id}>{rp.name} (${rp.amount})</option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Label>Próxima Fecha de Corte</Label>
                        <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                    </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Selección de Miembros</h4>
                        <div className="flex space-x-4 text-sm">
                            <label className="flex items-center cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="selectionMode" 
                                    checked={selectionMode === 'grade'} 
                                    onChange={() => handleModeChange('grade')}
                                    className="mr-2"
                                />
                                Por Grado/Curso
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="selectionMode" 
                                    checked={selectionMode === 'manual'} 
                                    onChange={() => handleModeChange('manual')}
                                    className="mr-2"
                                />
                                Lista Manual
                            </label>
                        </div>
                    </div>

                    {selectionMode === 'grade' ? (
                        <div>
                            <Label>Filtrar por Grado / Curso</Label>
                            <Select value={selectedGradeId} onChange={e => handleGradeSelection(e.target.value)}>
                                <option value="">-- Seleccione un grado --</option>
                                {gradeLevels.map(gl => (
                                    <option key={gl.id} value={gl.id}>{gl.name}</option>
                                ))}
                            </Select>
                            <p className="text-xs text-gray-500 mt-2">
                                Se seleccionarán automáticamente todos los padres con estudiantes en este grado.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <Input 
                                placeholder="Buscar padre por nombre..." 
                                value={parentSearchTerm} 
                                onChange={e => setParentSearchTerm(e.target.value)} 
                                className="mb-2"
                            />
                            <div className="border rounded-md max-h-40 overflow-y-auto p-2 bg-white">
                                {filteredParents.length > 0 ? filteredParents.map(parent => (
                                    <label key={parent.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedParentIds.includes(parent.id)} 
                                            onChange={() => handleManualParentToggle(parent.id)}
                                            className="rounded text-blue-600"
                                        />
                                        <span className="text-sm">{parent.name}</span>
                                    </label>
                                )) : <p className="text-xs text-gray-500 text-center py-2">No se encontraron padres.</p>}
                            </div>
                        </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="text-sm text-gray-700 flex justify-between items-center">
                            <span>Total Miembros Seleccionados:</span>
                            <span className="font-bold text-lg bg-blue-100 text-blue-800 px-2 rounded">{selectedParentIds.length}</span>
                        </div>
                        {selectionMode === 'grade' && selectedParentIds.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500 max-h-20 overflow-y-auto">
                                {selectedParentIds.map(pid => parents.find(p => p.id === pid)?.name).join(', ')}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? 'Creando...' : 'Crear Grupo'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
