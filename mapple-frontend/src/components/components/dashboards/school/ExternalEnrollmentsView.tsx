
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import type { ExternalEnrollment, Activity } from '../../../types';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';

type Status = 'Pending' | 'Confirmed' | 'Cancelled';

const statusColorMap: { [key in Status]?: 'yellow' | 'green' | 'red' } = {
    'Pending': 'yellow',
    'Confirmed': 'green',
    'Cancelled': 'red',
};

const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

export const ExternalEnrollmentsView: React.FC = () => {
    const { currentUser } = useAppContext();
    const [enrollments, setEnrollments] = useState<ExternalEnrollment[]>([]);
    const [activities, setActivities] = useState<Map<string, string>>(new Map());
    const [activityList, setActivityList] = useState<Activity[]>([]); // For the dropdown
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [activityFilter, setActivityFilter] = useState<string>('');

    const fetchData = useCallback(async () => {
        if (currentUser?.schoolId) {
            setIsLoading(true);
            try {
                const [enrollmentsData, activitiesData] = await Promise.all([
                    api.getExternalEnrollmentsBySchool(currentUser.schoolId),
                    api.getActivitiesBySchool(currentUser.schoolId)
                ]);
                setEnrollments(enrollmentsData);
                setActivityList(activitiesData);
                const activityMap = new Map<string, string>(activitiesData.map(a => [a.id, a.name]));
                setActivities(activityMap);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [currentUser?.schoolId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateStatus = async (id: string, status: 'Confirmed' | 'Cancelled', parentName: string, activityName: string) => {
        if (status === 'Confirmed') {
            const confirmMessage = `¿Desea aprobar la inscripción de ${parentName}?
            
Al confirmar, el sistema enviará automáticamente un correo/mensaje con:
1. Link de Pago para la actividad "${activityName}".
2. Instrucciones y fechas de pago (Tarjeta/Transferencia).
3. Invitación para registrarse en Mapple School y subir comprobantes de pago.`;
            
            if (!window.confirm(confirmMessage)) return;
        } else {
            if (!window.confirm('¿Seguro que desea rechazar/cancelar esta inscripción?')) return;
        }

        setUpdatingId(id);
        try {
            await api.updateExternalEnrollmentStatus(id, status);
            if (status === 'Confirmed') {
                alert(`✅ Inscripción aprobada exitosamente.
                
Se ha enviado la notificación a ${parentName} con el link de pago y el acceso para subir comprobantes.`);
            }
            fetchData(); // Refresh data
        } catch (error) {
            alert('Error al actualizar el estado.');
        } finally {
            setUpdatingId(null);
        }
    };

    // Filter logic
    const filteredEnrollments = enrollments.filter(enrollment => {
        const matchesSearch = 
            enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enrollment.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enrollment.parentEmail.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter ? enrollment.status === statusFilter : true;
        const matchesActivity = activityFilter ? enrollment.activityId === activityFilter : true;

        return matchesSearch && matchesStatus && matchesActivity;
    });

    const handleExportCSV = () => {
        if (filteredEnrollments.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }

        const headers = ["Actividad", "Estudiante", "Padre/Madre", "Email", "Teléfono", "Estado"];
        const rows = filteredEnrollments.map(e => {
            const actName = activities.get(e.activityId) || 'Desconocida';
            // Escape quotes for CSV
            const student = `"${e.studentName.replace(/"/g, '""')}"`;
            const parent = `"${e.parentName.replace(/"/g, '""')}"`;
            const activity = `"${actName.replace(/"/g, '""')}"`;
            
            return [activity, student, parent, e.parentEmail, e.parentPhone, e.status].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `inscripciones_externas_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-800">Inscripciones Externas</h2>
                <Button variant="secondary" onClick={handleExportCSV}>
                    <DownloadIcon /> <span className="ml-2">Exportar Reporte</span>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-grow">
                        <Input 
                            placeholder="Buscar por estudiante, padre o email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="md:w-48">
                        <Select value={activityFilter} onChange={(e) => setActivityFilter(e.target.value)}>
                            <option value="">Todas las Actividades</option>
                            {activityList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </Select>
                    </div>
                    <div className="md:w-48">
                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">Todos los Estados</option>
                            <option value="Pending">Pendiente</option>
                            <option value="Confirmed">Confirmado</option>
                            <option value="Cancelled">Cancelado</option>
                        </Select>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    Solicitudes de padres externos recibidas a través de los enlaces públicos.
                    {statusFilter === 'Pending' && <strong> Mostrando solo inscripciones pendientes de confirmación.</strong>}
                </p>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Padre/Madre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center py-4">Cargando...</td></tr>
                            ) : filteredEnrollments.length > 0 ? (
                                filteredEnrollments.map((enrollment) => {
                                    const actName = activities.get(enrollment.activityId) || 'Actividad desconocida';
                                    return (
                                    <tr key={enrollment.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{actName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enrollment.studentName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="font-medium text-gray-900">{enrollment.parentName}</div>
                                            <div className="text-xs text-gray-400">{enrollment.parentEmail} | {enrollment.parentPhone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge color={statusColorMap[enrollment.status]}>{enrollment.status}</Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            {enrollment.status === 'Pending' && (
                                                <>
                                                    <Button variant="primary" className="text-xs bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(enrollment.id, 'Confirmed', enrollment.parentName, actName)} disabled={updatingId === enrollment.id}>
                                                        Aprobar & Enviar Pago
                                                    </Button>
                                                    <Button variant="danger" className="text-xs" onClick={() => handleUpdateStatus(enrollment.id, 'Cancelled', enrollment.parentName, actName)} disabled={updatingId === enrollment.id}>
                                                        Rechazar
                                                    </Button>
                                                </>
                                            )}
                                            {enrollment.status === 'Confirmed' && <span className="text-xs text-green-600 font-medium">Notificación Enviada</span>}
                                        </td>
                                    </tr>
                                )})
                            ) : (
                                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No se encontraron inscripciones con los filtros seleccionados.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};
