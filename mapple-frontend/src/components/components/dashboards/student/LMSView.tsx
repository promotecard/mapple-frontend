
import React, { useState, useEffect } from 'react';
import type { Student, Course, StudentCourseProgress } from '../../../types';
import { api } from '../../../services/mockApi';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';

interface LMSViewProps {
    student: Student;
}

export const LMSView: React.FC<LMSViewProps> = ({ student }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [progress, setProgress] = useState<Map<string, StudentCourseProgress>>(new Map());
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // State to manage currently viewed content modal/expansion
    const [viewingContent, setViewingContent] = useState<any | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [coursesData, progressData] = await Promise.all([
                api.getCoursesBySchool(student.schoolId),
                api.getStudentCourseProgress(student.id)
            ]);
            
            const studentCourses = coursesData.filter(c => c.targetGradeLevels.includes(student.gradeLevel));
            setCourses(studentCourses);

            const progressMap = new Map<string, StudentCourseProgress>();
            progressData.forEach(p => progressMap.set(p.courseId, p));
            setProgress(progressMap);
            
            setIsLoading(false);
        };
        fetchData();
    }, [student]);

    if (isLoading) return <p>Cargando tus cursos...</p>;
    
    if (selectedCourse) {
        const courseProgress = progress.get(selectedCourse.id);
        const completedCount = courseProgress?.completedLessonIds.length || 0;
        const totalLessons = selectedCourse.modules.reduce((acc, mod) => acc + mod.contents.length, 0);
        const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        return (
            <div>
                <Button variant="secondary" onClick={() => { setSelectedCourse(null); setViewingContent(null); }} className="mb-4">&larr; Volver a Mis Cursos</Button>
                <Card>
                    <div className="relative h-48 rounded-t-xl overflow-hidden">
                        <img src={selectedCourse.imageUrl} alt={selectedCourse.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-6">
                            <h1 className="text-3xl font-bold text-white">{selectedCourse.title}</h1>
                            <p className="text-gray-200">{selectedCourse.shortDescription}</p>
                        </div>
                    </div>
                    <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Lecciones</h2>
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-blue-700">Progreso</span>
                                <span className="text-sm font-medium text-blue-700">{percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                        </div>
                        
                        {viewingContent && (
                            <div className="mb-6 p-4 border rounded-lg bg-blue-50">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{viewingContent.title}</h3>
                                    <button onClick={() => setViewingContent(null)} className="text-gray-500 hover:text-gray-700">X</button>
                                </div>
                                <div className="bg-white p-4 rounded shadow-sm">
                                    {viewingContent.type === 'video_embed' && (
                                        <div className="aspect-w-16 aspect-h-9">
                                            <iframe src={viewingContent.data} className="w-full h-64 md:h-96" frameBorder="0" allowFullScreen title={viewingContent.title}></iframe>
                                        </div>
                                    )}
                                    {viewingContent.type === 'video_upload' && (
                                        <video controls className="w-full max-h-96 bg-black">
                                            <source src={viewingContent.data} type="video/mp4" />
                                            Tu navegador no soporta el elemento de video.
                                        </video>
                                    )}
                                    {viewingContent.type === 'text' && <div className="prose max-w-none whitespace-pre-wrap">{viewingContent.data}</div>}
                                    {viewingContent.type === 'file' && (
                                        <div className="text-center py-8">
                                            <p>Este contenido es un archivo descargable.</p>
                                            <a href={viewingContent.data} download className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Descargar Archivo</a>
                                        </div>
                                    )}
                                    {viewingContent.type === 'link' && (
                                        <div className="text-center py-8">
                                            <p>Recurso externo:</p>
                                            <a href={viewingContent.data} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-lg">{viewingContent.data}</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <ul className="space-y-3">
                            {selectedCourse.modules.flatMap(m => m.contents).map(content => {
                                const isCompleted = courseProgress?.completedLessonIds.includes(content.id);
                                const isViewing = viewingContent?.id === content.id;
                                return (
                                     <li key={content.id} className={`p-4 rounded-lg flex items-center justify-between ${isCompleted ? 'bg-green-50 border-l-4 border-green-500' : isViewing ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'}`}>
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500' : 'border-2 border-gray-400'}`}>
                                                {isCompleted && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                            <div>
                                                <span className="font-medium block">{content.title}</span>
                                                <span className="text-xs text-gray-500 uppercase">{content.type.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                        <Button variant="secondary" size="sm" onClick={() => setViewingContent(content)}>Ver Lección</Button>
                                    </li>
                                )
                            })}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => {
                    const courseProgress = progress.get(course.id);
                    const completedCount = courseProgress?.completedLessonIds.length || 0;
                    const totalLessons = course.modules.reduce((acc, m) => acc + m.contents.length, 0);
                    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

                    return (
                        <Card key={course.id} className="flex flex-col cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setSelectedCourse(course)}>
                            <img src={course.imageUrl} alt={course.title} className="h-40 w-full object-cover rounded-t-xl" />
                            <CardContent className="p-4 flex-grow flex flex-col">
                                <h3 className="font-bold text-lg flex-grow">{course.title}</h3>
                                <div className="mt-4">
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${percentage}%`}}></div>
                                    </div>
                                    <p className="text-xs text-gray-500">{completedCount} de {totalLessons} lecciones completadas</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
