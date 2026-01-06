import React, { useState, useEffect } from 'react';
import type { Activity, Student, User, ActivityEnrollment } from '../../types';
import { Role } from '../../types';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { api } from '../../services/mockApi';
import { Label } from '../ui/Label';

interface ActivityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity;
}

interface EnrolledStudentInfo extends Student {
  parentName: string;
}

export const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({ isOpen, onClose, activity }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'participants' | 'materials'>('details');
    const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudentInfo[]>([]);
    const [parents, setParents] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            const fetchDetails = async () => {
                setIsLoading(true);
                try {
                    // Fetch all related data in parallel
                    const [enrollments, allStudentsInSchool, allUsers] = await Promise.all([
                        api.getEnrollmentsForActivity(activity.id),
                        api.getStudentsBySchool(activity.schoolId),
                        api.getUsers()
                    ]);
                    
                    const parentUsers = allUsers.filter(u => u.role === Role.Parent && u.schoolId === activity.schoolId);
                    setParents(parentUsers);

                    // Process enrolled students
                    const enrolledStudentIds = enrollments.map(e => e.studentId);
                    const enrolledStudentDetails = allStudentsInSchool.filter(s => enrolledStudentIds.includes(s.id));
                    
                    const enrolledWithParentInfo: EnrolledStudentInfo[] = enrolledStudentDetails.map(student => {
                        const parent = parentUsers.find(p => p.id === student.parentId);
                        return { ...student, parentName: parent?.name || 'N/A' };
                    });
                    setEnrolledStudents(enrolledWithParentInfo);

                } catch (error) {
                    console.error("Failed to fetch activity details:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDetails();
        }
    }, [isOpen, activity]);

    const renderDetails = () => (
        <div className="space-y-4 text-sm">
            <p className="text-gray-600">{activity.description}</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div><Label>Responsable</Label><p>{activity.responsiblePerson}</p></div>
                <div><Label>Estado</Label><p><Badge>{activity.status}</Badge></p></div>
                <div><Label>Fechas</Label><p>{new Date(activity.startDate).toLocaleString()} - {new Date(activity.endDate).toLocaleString()}</p></div>
                <div><Label>Cupo</Label><p>{activity.enrolledStudentIds.length} / {activity.maxCapacity}</p></div>
                <div><Label>Costo</Label><p>${activity.cost.toFixed(2)}</p></div>
                <div><Label>Niveles</Label><p>{activity.participatingLevels.join(', ')}</p></div>
                 <div><Label>Visibilidad</Label><p>{activity.visibility}</p></div>
                 <div><Label>Requiere confirmación</Label><p>{activity.requiresAssistanceRegistration ? 'Sí' : 'No'}</p></div>
            </div>
        </div>
    );
    
    const renderParticipants = () => (
        isLoading ? <p>Cargando participantes...</p> :
        enrolledStudents.length > 0 ? (
            <ul className="space-y-3">
                {enrolledStudents.map(student => (
                    <li key={student.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md">
                        <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full" />
                        <div>
                            <p className="font-medium text-gray-800">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.gradeLevel} (Padre/Madre: {student.parentName})</p>
                        </div>
                    </li>
                ))}
            </ul>
        ) : <p className="text-gray-500 text-center py-4">Aún no hay estudiantes inscritos.</p>
    );

    const renderMaterials = () => (
        isLoading ? <p>Cargando asignaciones...</p> :
        (activity.assignments && activity.assignments.length > 0) ? (
            <div className="space-y-4">
                <ul className="space-y-2">
                    {activity.assignments.map(assignment => {
                        const parent = parents.find(p => p.id === assignment.assignedParentId);
                        return (
                             <li key={assignment.id} className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-semibold text-gray-800">{assignment.description}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">Asignado a:</span> {parent?.name || 'Padre no encontrado'}
                                </p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        ) : <p className="text-gray-500 text-center py-4">Esta actividad no tiene asignaciones de materiales.</p>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={activity.name}>
             <div className="flex items-start space-x-4 mb-4">
                <img src={activity.imageUrl} alt={activity.name} className="w-48 h-32 object-cover rounded-lg" />
                 <div className="border-b border-gray-200 w-full">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button type="button" onClick={() => setActiveTab('details')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Detalles
                        </button>
                        <button type="button" onClick={() => setActiveTab('participants')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'participants' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Participantes ({enrolledStudents.length})
                        </button>
                        <button type="button" onClick={() => setActiveTab('materials')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'materials' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Asignación de Materiales
                        </button>
                    </nav>
                </div>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-1">
                {activeTab === 'details' && renderDetails()}
                {activeTab === 'participants' && renderParticipants()}
                {activeTab === 'materials' && renderMaterials()}
            </div>
        </Modal>
    );
};