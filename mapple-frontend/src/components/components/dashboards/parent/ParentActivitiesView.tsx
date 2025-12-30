
import React, { useState, useEffect } from 'react';
import type { Student, Activity } from '../../../types';
import { PaymentStatus } from '../../../types';
import { useAppContext } from '../../../context/AppContext';
import { api } from '../../../services/mockApi';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { ParentActivityEnrollmentModal } from '../../forms/ParentActivityEnrollmentModal';

const paymentStatusColorMap: { [key in PaymentStatus]?: 'green' | 'yellow' | 'blue' | 'red' } = {
    [PaymentStatus.Paid]: 'green',
    [PaymentStatus.Confirmed]: 'green',
    [PaymentStatus.Pending]: 'yellow',
    [PaymentStatus.ProofUploaded]: 'blue',
    [PaymentStatus.Rejected]: 'red',
};

interface ParentActivitiesViewProps {
    onNavigate: (view: string) => void;
    onBackToHome: () => void;
}

export const ParentActivitiesView: React.FC<ParentActivitiesViewProps> = ({onNavigate, onBackToHome}) => {
    const { currentUser } = useAppContext();
    const [students, setStudents] = useState<Student[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [enrolledActivities, setEnrolledActivities] = useState<(Activity & {paymentStatus?: PaymentStatus})[]>([]);
    
    // Modal state
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    useEffect(() => {
        if (currentUser) {
            api.getStudentsByParent(currentUser.id).then(setStudents);
        }
    }, [currentUser]);

    const fetchActivities = () => {
        if(currentUser?.schoolId) {
            api.getActivitiesBySchool(currentUser.schoolId).then(setActivities);
        }
        if (students.length > 0) {
            const studentIds = students.map(s => s.id);
            api.getEnrolledActivities(studentIds).then(setEnrolledActivities);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [currentUser, students]);

    const handleOpenEnroll = (activity: Activity) => {
        setSelectedActivity(activity);
        setIsEnrollModalOpen(true);
    };

    const handleEnrollSuccess = () => {
        fetchActivities();
    };
    
    const handleNavigateToPay = () => {
        setIsEnrollModalOpen(false);
        onNavigate('payments');
    }

    // Filter logic
    const upcomingActivities = activities.filter(act => new Date(act.startDate) > new Date());
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Actividades</h1>
                <Button variant="secondary" onClick={onBackToHome}>&larr; Volver a Inicio</Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><h2 className="text-xl font-semibold text-gray-800">Próximas Actividades</h2></CardHeader>
                    <CardContent className="space-y-4">
                        {upcomingActivities.length > 0 ? upcomingActivities.map(activity => (
                        <div 
                            key={activity.id} 
                            className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                            onClick={() => handleOpenEnroll(activity)}
                        >
                            <img src={activity.imageUrl} alt={activity.name} className="w-24 h-16 object-cover rounded-lg"/>
                            <div className="flex-grow">
                                <p className="font-semibold text-gray-800">{activity.name}</p>
                                <p className="text-sm text-gray-500">{new Date(activity.startDate).toLocaleString()}</p>
                                <p className="text-xs text-blue-600 font-medium mt-1">
                                    {activity.cost > 0 ? `$${activity.cost} ${activity.currency}` : 'Gratis'}
                                </p>
                            </div>
                            <Button className="text-xs" size="sm">Ver / Inscribir</Button>
                        </div>
                        )) : <p className="text-gray-500">No hay próximas actividades disponibles.</p>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><h2 className="text-xl font-semibold text-gray-800">Actividades Inscritas</h2></CardHeader>
                    <CardContent className="space-y-4">
                        {enrolledActivities.length > 0 ? enrolledActivities.map(activity => (
                        <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <img src={activity.imageUrl} alt={activity.name} className="w-24 h-16 object-cover rounded-lg"/>
                            <div className="flex-grow">
                            <p className="font-semibold">{activity.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <Badge color={paymentStatusColorMap[activity.paymentStatus!]}>{activity.paymentStatus}</Badge>
                                <p className="text-sm text-gray-500">{new Date(activity.startDate).toLocaleDateString()}</p>
                            </div>
                            </div>
                            {activity.paymentStatus === PaymentStatus.Pending && <Button className="text-xs" onClick={() => onNavigate('payments')}>Pagar Ahora</Button>}
                            {activity.paymentStatus === PaymentStatus.ProofUploaded && <Button variant="secondary" className="text-xs" disabled>Pendiente Confirmación</Button>}
                        </div>
                        )) : <p className="text-gray-500">No estás inscrito en ninguna actividad.</p>}
                    </CardContent>
                </Card>
            </div>

            {selectedActivity && (
                <ParentActivityEnrollmentModal 
                    isOpen={isEnrollModalOpen}
                    onClose={() => setIsEnrollModalOpen(false)}
                    activity={selectedActivity}
                    students={students}
                    onEnrollmentSuccess={handleEnrollSuccess}
                    onNavigateToPay={handleNavigateToPay}
                />
            )}
        </div>
    )
}
