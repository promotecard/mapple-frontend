
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import type { Activity, Student } from '../../types';
import { api } from '../../services/mockApi';

interface ParentActivityEnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    activity: Activity;
    students: Student[];
    onEnrollmentSuccess: () => void;
    onNavigateToPay: () => void;
}

export const ParentActivityEnrollmentModal: React.FC<ParentActivityEnrollmentModalProps> = ({ 
    isOpen, 
    onClose, 
    activity, 
    students, 
    onEnrollmentSuccess,
    onNavigateToPay
}) => {
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Filter students who are not yet enrolled
    const availableStudents = students.filter(s => !activity.enrolledStudentIds.includes(s.id));

    const handleEnroll = async () => {
        if (!selectedStudentId) return;
        setIsSubmitting(true);
        try {
            await api.enrollStudentInActivity(activity.id, selectedStudentId);
            setShowSuccess(true);
            onEnrollmentSuccess();
        } catch (error) {
            alert("Error al realizar la inscripción.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (showSuccess) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="¡Inscripción Exitosa!">
                <div className="text-center p-6">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Estudiante inscrito correctamente</h3>
                    
                    {activity.cost > 0 ? (
                        <>
                            <p className="mt-2 text-sm text-gray-500 mb-6">
                                Esta actividad tiene un costo de <strong>${activity.cost.toFixed(2)} {activity.currency}</strong>. 
                                Por favor, realice el pago para confirmar el cupo.
                            </p>
                            <div className="flex flex-col gap-3">
                                <Button onClick={onNavigateToPay} className="w-full">Ir a Pagar Ahora</Button>
                                <Button variant="secondary" onClick={onClose}>Pagar Luego</Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="mt-2 text-sm text-gray-500 mb-6">
                                La actividad es gratuita. El cupo ha sido confirmado.
                            </p>
                            <Button onClick={onClose} className="w-full">Cerrar</Button>
                        </>
                    )}
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={activity.name}
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleEnroll} disabled={isSubmitting || !selectedStudentId || availableStudents.length === 0}>
                        {isSubmitting ? 'Inscribiendo...' : 'Confirmar Inscripción'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Header Image */}
                <div className="h-40 w-full rounded-lg overflow-hidden bg-gray-100 mb-4">
                    <img src={activity.imageUrl} alt={activity.name} className="w-full h-full object-cover" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Fecha Inicio</p>
                        <p className="font-medium">{new Date(activity.startDate).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Costo</p>
                        <p className="font-medium text-green-600">
                            {activity.cost > 0 ? `$${activity.cost.toFixed(2)} ${activity.currency}` : 'Gratis'}
                        </p>
                    </div>
                </div>

                <div>
                    <Label>Descripción</Label>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{activity.description}</p>
                </div>

                <div>
                    <Label htmlFor="studentSelect">Seleccionar Estudiante</Label>
                    {availableStudents.length > 0 ? (
                        <Select
                            id="studentSelect"
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                        >
                            <option value="">-- Selecciona a tu hijo/a --</option>
                            {availableStudents.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </Select>
                    ) : (
                        <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                            Todos tus hijos elegibles ya están inscritos en esta actividad.
                        </div>
                    )}
                </div>
                
                {activity.cost > 0 && (
                    <p className="text-xs text-gray-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        El pago se generará automáticamente al inscribirse.
                    </p>
                )}
            </div>
        </Modal>
    );
};
