import React, { useState, useEffect, useCallback } from 'react';
import type { Student } from '../../../types';
import { useAppContext } from '../../../context/AppContext';
import { api } from '../../../services/mockApi';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';

interface DependentsViewProps {
    onViewProfile: (studentId: string) => void;
    onBackToHome: () => void;
}

export const DependentsView: React.FC<DependentsViewProps> = ({ onViewProfile, onBackToHome }) => {
    const { currentUser } = useAppContext();
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStudents = useCallback(async () => {
        if (currentUser) {
            setIsLoading(true);
            const studentsData = await api.getStudentsByParent(currentUser.id);
            setStudents(studentsData);
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    if (isLoading) return <p>Cargando dependientes...</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Mis Dependientes</h1>
                <Button variant="secondary" onClick={onBackToHome}>&larr; Volver a Inicio</Button>
            </div>
            {students.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {students.map(student => (
                        <Card key={student.id}>
                            <CardContent className="flex items-center space-x-4 p-6">
                                <img src={student.avatarUrl} alt={student.name} className="w-24 h-24 rounded-full object-cover"/>
                                <div className="flex-grow">
                                    <h2 className="text-xl font-bold">{student.name}</h2>
                                    <p className="text-gray-600">{student.gradeLevel}</p>
                                    <div className="mt-2">
                                        <Badge color={student.profileStatus === 'Complete' ? 'green' : 'yellow'}>
                                            Perfil {student.profileStatus}
                                        </Badge>
                                    </div>
                                    <Button variant="secondary" className="mt-4 text-sm" onClick={() => onViewProfile(student.id)}>
                                        Ver Perfil Completo
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <p>No tienes dependientes registrados.</p>
            )}
        </div>
    );
};