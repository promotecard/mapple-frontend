import React, { useState, useEffect, useCallback } from 'react';
import type { Student } from '../../../types';
import { useAppContext } from '../../../context/AppContext';
import { api } from '../../../services/mockApi';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { AddFundsModal } from '../../forms/AddFundsModal';

interface FundManagementViewProps {
    onBack: () => void;
}

export const FundManagementView: React.FC<FundManagementViewProps> = ({ onBack }) => {
    const { currentUser } = useAppContext();
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleAddFunds = (student: Student) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        setSelectedStudent(null);
        fetchStudents(); // Re-fetch students to show updated balance
    };

    if (isLoading) return <p>Cargando balances...</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Gestionar Fondos de Consumo</h1>
                <Button variant="secondary" onClick={onBack}>&larr; Volver a Gestión Escolar</Button>
            </div>

            <Card>
                <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-6">Aquí puedes ver y recargar el balance que tus hijos tienen disponible para consumir en la cafetería y otros puntos de venta del colegio.</p>
                    {students.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {students.map(student => (
                                <div key={student.id} className="p-4 border rounded-lg flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                                    <img src={student.avatarUrl} alt={student.name} className="w-20 h-20 rounded-full object-cover"/>
                                    <div className="flex-grow text-center md:text-left">
                                        <h2 className="text-lg font-bold">{student.name}</h2>
                                        <p className="text-sm text-gray-500">Balance Actual:</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            ${(student.corporateCreditBalance || 0).toFixed(2)}
                                        </p>
                                    </div>
                                    <Button onClick={() => handleAddFunds(student)} className="w-full md:w-auto">
                                        Añadir Fondos
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No tienes dependientes registrados.</p>
                    )}
                </CardContent>
            </Card>

            {isModalOpen && selectedStudent && (
                <AddFundsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    student={selectedStudent}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};
