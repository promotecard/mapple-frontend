import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/mockApi';
import type { Student, AttendanceRecord } from '../../../types';
import { AttendanceStatus } from '../../../types';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';
import { Label } from '../../ui/Label';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';

const getWeekDays = (date: Date): Date[] => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startOfWeek.setDate(diff);

    const week: Date[] = [];
    for (let i = 0; i < 5; i++) {
        const weekDay = new Date(startOfWeek);
        weekDay.setDate(startOfWeek.getDate() + i);
        week.push(weekDay);
    }
    return week;
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const statusConfig: { [key in AttendanceStatus]: { label: string; color: string; next: AttendanceStatus, badgeColor: 'green' | 'yellow' | 'red' } } = {
    [AttendanceStatus.Present]: { label: 'P', color: 'bg-green-500', next: AttendanceStatus.Late, badgeColor: 'green' },
    [AttendanceStatus.Late]: { label: 'T', color: 'bg-yellow-400', next: AttendanceStatus.Absent, badgeColor: 'yellow' },
    [AttendanceStatus.Absent]: { label: 'A', color: 'bg-red-500', next: AttendanceStatus.Present, badgeColor: 'red' }
};


const AttendanceTakingTab: React.FC<{ students: Student[] }> = ({ students }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weekDates, setWeekDates] = useState<Date[]>([]);
    const [attendanceData, setAttendanceData] = useState<Map<string, AttendanceRecord>>(new Map());
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setWeekDates(getWeekDays(currentDate));
    }, [currentDate]);

    const fetchAttendance = useCallback(async () => {
        if (students.length === 0 || weekDates.length === 0) return;

        setIsLoading(true);
        const studentIds = students.map(s => s.id);
        const startDate = formatDate(weekDates[0]);
        const endDate = formatDate(weekDates[4]);

        const records = await api.getAttendanceForStudentsByDateRange(studentIds, startDate, endDate);
        
        const newAttendanceData = new Map<string, AttendanceRecord>();
        records.forEach(record => {
            newAttendanceData.set(`${record.studentId}:${record.date}`, record);
        });
        setAttendanceData(newAttendanceData);
        setIsLoading(false);
    }, [students, weekDates]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const handleStatusChange = async (studentId: string, date: Date) => {
        const dateString = formatDate(date);
        const key = `${studentId}:${dateString}`;
        const currentRecord = attendanceData.get(key);
        const currentStatus = currentRecord?.status;

        const nextStatus = currentStatus ? statusConfig[currentStatus].next : AttendanceStatus.Present;

        const newRecord: AttendanceRecord = {
            id: currentRecord?.id || `new-${key}`,
            studentId,
            date: dateString,
            status: nextStatus,
            excused: false
        };
        const newAttendanceData = new Map(attendanceData);
        newAttendanceData.set(key, newRecord);
        setAttendanceData(newAttendanceData);

        try {
            await api.recordAttendance(studentId, dateString, nextStatus, false, '');
        } catch (e) {
            console.error("Failed to save attendance", e);
            const revertedData = new Map(attendanceData);
            if (currentRecord) {
                revertedData.set(key, currentRecord);
            } else {
                revertedData.delete(key);
            }
            setAttendanceData(revertedData);
            alert("Error al guardar la asistencia.");
        }
    };

    const changeWeek = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + offset * 7);
            return newDate;
        });
    };
    
    const weekDisplayFormat = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });
    
    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-semibold">Registro de Asistencia</h2>
                    <p className="text-sm text-gray-500 capitalize">{weekDisplayFormat.format(currentDate)}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="secondary" onClick={() => changeWeek(-1)}>&larr; Semana Anterior</Button>
                    <Button variant="secondary" onClick={() => setCurrentDate(new Date())}>Hoy</Button>
                    <Button variant="secondary" onClick={() => changeWeek(1)}>Semana Siguiente &rarr;</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="sticky left-0 bg-gray-100 p-3 text-left text-sm font-semibold text-gray-700 border-b border-r w-64 z-10">Estudiante</th>
                                {weekDates.map(date => (
                                    <th key={date.toISOString()} className="p-3 text-center text-sm font-semibold text-gray-700 border-b min-w-[80px]">
                                        <div>{date.toLocaleDateString('es-ES', { weekday: 'long' })}</div>
                                        <div className="font-normal text-xs">{date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="sticky left-0 bg-white hover:bg-gray-50 p-3 text-sm font-medium text-gray-800 border-b border-r flex items-center space-x-3 w-64 z-10">
                                        <img src={student.avatarUrl} alt={student.name} className="w-8 h-8 rounded-full" />
                                        <span>{student.name}</span>
                                    </td>
                                    {weekDates.map(date => {
                                        const key = `${student.id}:${formatDate(date)}`;
                                        const record = attendanceData.get(key);
                                        const status = record?.status;
                                        const config = status ? statusConfig[status] : null;
                                        const isFuture = formatDate(date) > formatDate(new Date());

                                        return (
                                            <td key={key} className="p-1 text-center border-b">
                                                <button 
                                                    onClick={() => handleStatusChange(student.id, date)}
                                                    disabled={isFuture}
                                                    className={`w-12 h-12 rounded-lg text-white font-bold text-lg flex items-center justify-center mx-auto transition-colors ${
                                                        isFuture ? 'bg-gray-200 cursor-not-allowed' :
                                                        config ? `${config.color} hover:opacity-80` : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {config?.label || '-'}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {isLoading && <p className="text-center p-4">Cargando datos de asistencia...</p>}
                </div>
            </CardContent>
        </Card>
    );
};

const ReportsTab: React.FC<{ students: Student[] }> = ({ students }) => {
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [reportStartDate, setReportStartDate] = useState('');
    const [reportEndDate, setReportEndDate] = useState('');
    const [reportData, setReportData] = useState<AttendanceRecord[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateReport = async () => {
        if (!selectedStudentId || !reportStartDate || !reportEndDate) {
            alert("Por favor, seleccione un estudiante y un rango de fechas.");
            return;
        }
        setIsGenerating(true);
        setReportData([]);
        try {
            const data = await api.getAttendanceForStudentsByDateRange([selectedStudentId], reportStartDate, reportEndDate);
            setReportData(data.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        } catch (e) {
            alert("Error al generar el reporte.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleExportCSV = () => {
        if (reportData.length === 0) return;
        
        const studentName = students.find(s => s.id === selectedStudentId)?.name || 'estudiante';
        const headers = ["Fecha", "Estado", "Justificada", "Notas"];
        const rows = reportData.map(r => 
            [
                r.date,
                r.status,
                r.excused ? 'Sí' : 'No',
                `"${r.notes || ''}"` // Wrap notes in quotes to handle commas
            ].join(',')
        );

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `reporte_asistencia_${studentName}_${reportStartDate}_a_${reportEndDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card>
            <CardHeader><h2 className="text-xl font-semibold">Generador de Reportes de Asistencia</h2></CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end p-4 border rounded-lg bg-gray-50 mb-6">
                    <div className="lg:col-span-2">
                        <Label htmlFor="student-select">Estudiante</Label>
                        <Select id="student-select" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}>
                            <option value="">Seleccione un estudiante...</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="start-date">Fecha de Inicio</Label>
                        <Input type="date" id="start-date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="end-date">Fecha de Fin</Label>
                        <Input type="date" id="end-date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)} />
                    </div>
                    <div className="lg:col-span-4 flex justify-end gap-2">
                         <Button onClick={handleGenerateReport} disabled={!selectedStudentId || isGenerating}>
                            {isGenerating ? 'Generando...' : 'Generar Reporte'}
                         </Button>
                         <Button variant="secondary" onClick={handleExportCSV} disabled={reportData.length === 0}>
                            Exportar a Excel
                         </Button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Justificada</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {isGenerating ? (
                                <tr><td colSpan={4} className="text-center p-4">Generando reporte...</td></tr>
                            ) : reportData.length > 0 ? (
                                reportData.map(record => (
                                    <tr key={record.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{record.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Badge color={statusConfig[record.status]?.badgeColor || 'gray'}>
                                                {record.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{record.excused ? 'Sí' : 'No'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{record.notes}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="text-center p-8 text-gray-500">Seleccione un estudiante y un rango de fechas para generar un reporte.</td></tr>
                            )}
                         </tbody>
                    </table>
                </div>

            </CardContent>
        </Card>
    );
};


interface AttendanceViewProps {
    students: Student[];
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ students }) => {
    const [activeTab, setActiveTab] = useState<'attendance' | 'reports'>('attendance');

    return (
         <div className="space-y-4">
            <div className="flex border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('attendance')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'attendance' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Tomar Asistencia
                </button>
                <button 
                    onClick={() => setActiveTab('reports')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'reports' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Reportes
                </button>
            </div>
            
            {activeTab === 'attendance' && <AttendanceTakingTab students={students} />}
            {activeTab === 'reports' && <ReportsTab students={students} />}
        </div>
    );
};