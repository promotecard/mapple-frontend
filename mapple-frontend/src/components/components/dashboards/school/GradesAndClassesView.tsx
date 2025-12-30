import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import type { GradeLevel, Classroom, User, Student } from '../../../types';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { GradeLevelModal } from '../../forms/GradeLevelModal';
import { ClassroomModal } from '../../forms/ClassroomModal';
import { PromotionModal } from '../../forms/PromotionModal';
import { Select } from '../../ui/Select';
import { Badge } from '../../ui/Badge';

const GradeLevelsTab: React.FC<{ gradeLevels: GradeLevel[], onUpdate: () => void }> = ({ gradeLevels, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);

    const handleEdit = (grade: GradeLevel) => {
        setSelectedGrade(grade);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedGrade(null);
        setIsModalOpen(true);
    };
    
    const handleSave = () => {
        onUpdate();
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button onClick={handleCreate}>+ Crear Nivel de Grado</Button>
            </div>
            <div className="space-y-3">
                {gradeLevels.map(grade => (
                    <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{grade.name}</span>
                        <Button variant="secondary" size="sm" onClick={() => handleEdit(grade)}>Editar</Button>
                    </div>
                ))}
            </div>
            {isModalOpen && (
                <GradeLevelModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    gradeLevel={selectedGrade}
                />
            )}
        </>
    );
};

const ClassroomsTab: React.FC<{ 
    gradeLevels: GradeLevel[], 
    classrooms: Classroom[], 
    staff: User[],
    students: Student[],
    onUpdate: () => void 
}> = ({ gradeLevels, classrooms, staff, students, onUpdate }) => {
    const [isClassroomModalOpen, setIsClassroomModalOpen] = useState(false);
    const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
    
    const getCurrentSchoolYear = () => {
        const now = new Date();
        const year = now.getFullYear();
        // Assuming school year starts around August
        if (now.getMonth() >= 7) { 
            return `${year}-${year + 1}`;
        } else {
            return `${year - 1}-${year}`;
        }
    };

    const [schoolYearFilter, setSchoolYearFilter] = useState<string>(getCurrentSchoolYear());

    const handleEdit = (classroom: Classroom) => {
        setSelectedClassroom(classroom);
        setIsClassroomModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedClassroom(null);
        setIsClassroomModalOpen(true);
    };
    
    const handlePromote = (classroom: Classroom) => {
        setSelectedClassroom(classroom);
        setIsPromotionModalOpen(true);
    };

    const handleSave = () => {
        onUpdate();
        setIsClassroomModalOpen(false);
        setIsPromotionModalOpen(false);
    };
    
    const getGradeName = (id: string) => gradeLevels.find(g => g.id === id)?.name || 'N/A';
    const getTeacherName = (id?: string) => staff.find(s => s.id === id)?.name || 'Sin asignar';

    const generateSchoolYears = () => {
        const existingYears = [...new Set(classrooms.map(c => c.schoolYear))];
        const currentYear = new Date().getFullYear();
        const generatedYears: string[] = [];
        for (let i = -5; i <= 1; i++) {
            const startYear = currentYear + i;
            generatedYears.push(`${startYear}-${startYear + 1}`);
        }
        const allYears = [...new Set([...generatedYears, ...existingYears])];
        return allYears.sort((a, b) => b.localeCompare(a)); // Sort descending
    };

    const schoolYears = generateSchoolYears();

    const filteredClassrooms = classrooms.filter(c => c.schoolYear === schoolYearFilter);

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="schoolYearFilter" className="text-sm font-medium">Año Escolar:</label>
                    <Select id="schoolYearFilter" value={schoolYearFilter} onChange={e => setSchoolYearFilter(e.target.value)}>
                        {schoolYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </Select>
                </div>
                <Button onClick={handleCreate}>+ Crear Curso/Aula</Button>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClassrooms.map(classroom => (
                    <Card key={classroom.id} className="flex flex-col">
                        <CardHeader>
                            <h3 className="font-bold text-lg">{classroom.name}</h3>
                            <p className="text-sm text-gray-500">{getGradeName(classroom.gradeLevelId)}</p>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2 text-sm">
                            <p><strong>Profesor(a):</strong> {getTeacherName(classroom.teacherId)}</p>
                            <p><strong>Asistente:</strong> {getTeacherName(classroom.assistantId)}</p>
                            <p><strong>Estudiantes:</strong> <Badge color="blue">{classroom.studentIds.length}</Badge></p>
                        </CardContent>
                        <div className="p-4 bg-gray-50 border-t flex flex-wrap gap-2 justify-end">
                            <Button variant="secondary" size="sm" onClick={() => handleEdit(classroom)}>Gestionar</Button>
                            <Button variant="primary" size="sm" onClick={() => handlePromote(classroom)}>Promover Curso</Button>
                        </div>
                    </Card>
                ))}
            </div>

            {isClassroomModalOpen && (
                <ClassroomModal 
                    isOpen={isClassroomModalOpen}
                    onClose={() => setIsClassroomModalOpen(false)}
                    onSave={handleSave}
                    classroom={selectedClassroom}
                    allGradeLevels={gradeLevels}
                    allStaff={staff}
                    allStudents={students}
                />
            )}
             {isPromotionModalOpen && selectedClassroom && (
                <PromotionModal
                    isOpen={isPromotionModalOpen}
                    onClose={() => setIsPromotionModalOpen(false)}
                    onSave={handleSave}
                    fromClassroom={selectedClassroom}
                    allClassrooms={classrooms}
                    allStudents={students}
                />
            )}
        </>
    );
};

export const GradesAndClassesView: React.FC = () => {
    const { currentUser } = useAppContext();
    const [activeTab, setActiveTab] = useState<'grades' | 'classes'>('classes');
    const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [staff, setStaff] = useState<User[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if(currentUser?.schoolId){
            setIsLoading(true);
            const [gradesData, classesData, staffData, studentsData] = await Promise.all([
                api.getGradeLevelsBySchool(currentUser.schoolId),
                api.getClassroomsBySchool(currentUser.schoolId),
                api.getStaffBySchool(currentUser.schoolId),
                api.getStudentsBySchool(currentUser.schoolId),
            ]);
            setGradeLevels(gradesData);
            setClassrooms(classesData);
            setStaff(staffData.filter(u => u.role === 'Teacher')); // Only teachers can be assigned
            setStudents(studentsData);
            setIsLoading(false);
        }
    }, [currentUser?.schoolId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading) {
        return <p>Cargando estructura académica...</p>
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex border-b border-gray-200">
                    <button onClick={() => setActiveTab('classes')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'classes' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        Cursos / Aulas
                    </button>
                    <button onClick={() => setActiveTab('grades')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'grades' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        Niveles de Grado
                    </button>
                </div>
            </CardHeader>
            <CardContent>
                {activeTab === 'grades' && <GradeLevelsTab gradeLevels={gradeLevels} onUpdate={fetchData} />}
                {activeTab === 'classes' && <ClassroomsTab gradeLevels={gradeLevels} classrooms={classrooms} staff={staff} students={students} onUpdate={fetchData} />}
            </CardContent>
        </Card>
    );
};