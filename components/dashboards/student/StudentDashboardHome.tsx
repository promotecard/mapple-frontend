import React from 'react';
import type { Student } from '../../../types';
import { Card, CardContent } from '../../ui/Card';

interface StudentDashboardHomeProps {
    student: Student;
}

export const StudentDashboardHome: React.FC<StudentDashboardHomeProps> = ({ student }) => {

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 bg-gradient-to-br from-green-400 to-verde-maple text-white">
                    <CardContent className="p-6 text-center">
                        <p className="text-sm font-medium opacity-80 mb-2">Mi Saldo Disponible</p>
                        <p className="text-5xl font-extrabold">${(student.corporateCreditBalance || 0).toFixed(2)}</p>
                        <p className="text-xs opacity-80 mt-2">Para consumo en la cafetería</p>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                     <CardContent className="p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Accesos Rápidos</h2>
                         <p className="text-gray-600">
                            Utiliza el menú de la izquierda para navegar a la Biblioteca de recursos, ver tus Cursos asignados o contactar a tu Tutor Virtual.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};