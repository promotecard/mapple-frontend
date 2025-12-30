import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import type { Activity } from '../../../types';
import { Status } from '../../../types';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Badge } from '../../ui/Badge';
import { ActivityModal } from '../../forms/ActivityModal';
import { ActivityDetailsModal } from '../../forms/ActivityDetailsModal';
import { ShareActivityModal } from '../../forms/ShareActivityModal';


const statusColorMap: { [key in Status]?: 'green' | 'yellow' | 'red' | 'gray' } = {
    [Status.Confirmed]: 'green',
    [Status.Pending]: 'yellow',
    [Status.Cancelled]: 'red',
    [Status.Rescheduled]: 'gray',
};

export const ActivitiesView: React.FC = () => {
    const { currentUser } = useAppContext();
    const [allActivities, setAllActivities] = useState<Activity[]>([]);
    const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    const fetchActivities = useCallback(async () => {
        if (currentUser?.schoolId) {
            const data = await api.getActivitiesBySchool(currentUser.schoolId);
            setAllActivities(data);
        }
    }, [currentUser?.schoolId]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    useEffect(() => {
        let result = allActivities;
        if (searchTerm) {
            result = result.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (statusFilter) {
            result = result.filter(a => a.status === statusFilter);
        }
        setFilteredActivities(result);
    }, [searchTerm, statusFilter, allActivities]);

    const handleCreate = () => {
        setSelectedActivity(null);
        setIsEditModalOpen(true);
    };

    const handleEdit = (activity: Activity) => {
        setSelectedActivity(activity);
        setIsEditModalOpen(true);
    };
    
    const handleViewDetails = (activity: Activity) => {
        setSelectedActivity(activity);
        setIsDetailsModalOpen(true);
    }
    
    const handleShare = (activity: Activity) => {
        setSelectedActivity(activity);
        setIsShareModalOpen(true);
    }

    const handleModalClose = () => {
        setIsEditModalOpen(false);
        setIsDetailsModalOpen(false);
        setIsShareModalOpen(false);
        setSelectedActivity(null);
    }
    
    const handleSave = () => {
        fetchActivities();
        handleModalClose();
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-800">Gestión de Actividades</h2>
                    <Button variant="primary" onClick={handleCreate}>+ Crear nueva actividad</Button>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-4 pb-4 border-b border-gray-200">
                        <Input
                            placeholder="Buscar por nombre de actividad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-grow"
                        />
                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="md:w-48">
                            <option value="">Todos los estados</option>
                            {Object.values(Status).filter(s => [Status.Pending, Status.Confirmed, Status.Cancelled, Status.Rescheduled].includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cupo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredActivities.map((activity) => (
                                    <tr key={activity.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img className="h-10 w-10 rounded-md object-cover" src={activity.imageUrl || 'https://via.placeholder.com/40x40.png?text=Arte'} alt={activity.name} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{activity.name}</div>
                                                    <div className="text-sm text-gray-500">{activity.participatingLevels.join(', ')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(activity.startDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.enrolledStudentIds.length} / {activity.maxCapacity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge color={statusColorMap[activity.status]}>{activity.status}</Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Button variant="secondary" className="text-xs" onClick={() => handleShare(activity)}>Compartir</Button>
                                            <Button variant="secondary" className="text-xs" onClick={() => handleViewDetails(activity)}>Ver detalles</Button>
                                            <Button variant="secondary" className="text-xs" onClick={() => handleEdit(activity)}>Editar</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {isEditModalOpen && (
                <ActivityModal
                    isOpen={isEditModalOpen}
                    onClose={handleModalClose}
                    onSave={handleSave}
                    activity={selectedActivity}
                />
            )}
            
            {isDetailsModalOpen && selectedActivity && (
                <ActivityDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={handleModalClose}
                    activity={selectedActivity}
                />
            )}

            {isShareModalOpen && selectedActivity && (
                <ShareActivityModal
                    isOpen={isShareModalOpen}
                    onClose={handleModalClose}
                    activity={selectedActivity}
                />
            )}
        </>
    );
};