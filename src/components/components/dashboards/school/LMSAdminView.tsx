
import React, { useState, useEffect, useCallback } from 'react';
import type { Course } from '../../../types';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { CourseEditorModal } from '../../forms/CourseEditorModal';

export const LMSAdminView: React.FC = () => {
    const { currentUser } = useAppContext();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const fetchCourses = useCallback(async () => {
        if (currentUser?.schoolId) {
            setIsLoading(true);
            const data = await api.getCoursesBySchool(currentUser.schoolId);
            setCourses(data);
            setIsLoading(false);
        }
    }, [currentUser?.schoolId]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleCreate = () => {
        setSelectedCourse(null);
        setIsEditorOpen(true);
    };

    const handleEdit = (course: Course) => {
        setSelectedCourse(course);
        setIsEditorOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("¿Está seguro de eliminar este curso?")) {
            await api.deleteCourse(id);
            fetchCourses();
        }
    };

    const handleSave = () => {
        fetchCourses();
        setIsEditorOpen(false);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Gestión de Cursos (LMS)</h2>
                    <Button onClick={handleCreate}>+ Nuevo Curso</Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? <p className="text-center p-4">Cargando cursos...</p> : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Módulos</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {courses.length > 0 ? courses.map(course => (
                                        <tr key={course.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img className="h-10 w-10 rounded object-cover" src={course.imageUrl || 'https://via.placeholder.com/40'} alt="" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                                        <div className="text-xs text-gray-500">{course.level}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.modules?.length || 0}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge color={course.status === 'Active' ? 'green' : 'gray'}>{course.status}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {course.isPaid ? `$${course.price}` : 'Gratis'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <Button variant="secondary" size="sm" onClick={() => handleEdit(course)}>Editar</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(course.id)}>Eliminar</Button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={6} className="text-center p-6 text-gray-500">No hay cursos creados.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {isEditorOpen && (
                <CourseEditorModal 
                    isOpen={isEditorOpen}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={handleSave}
                    course={selectedCourse}
                />
            )}
        </>
    );
};
