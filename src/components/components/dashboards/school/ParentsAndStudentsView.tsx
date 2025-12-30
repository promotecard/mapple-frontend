
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import type { User, Student, UserWithPassword, Classroom, GradeLevel } from '../../../types';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { ParentModal } from '../../forms/ParentModal';
import { StudentModal } from '../../forms/StudentModal';
import { Badge } from '../../ui/Badge';
import { ShareProfileModal } from '../../forms/ShareProfileModal';

interface ParentsListTabProps {
    onDataChange: () => void;
}

const ParentsListTab: React.FC<ParentsListTabProps> = ({ onDataChange }) => {
    const { currentUser } = useAppContext();
    const [parents, setParents] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserWithPassword | null>(null);

    const fetchParents = useCallback(async () => {
        if (currentUser?.schoolId) {
            const data = await api.getParentsBySchool(currentUser.schoolId);
            setParents(data);
        }
    }, [currentUser?.schoolId]);

    useEffect(() => {
        fetchParents();
    }, [fetchParents]);

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        fetchParents();
        onDataChange(); // Notify parent component of data change
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button onClick={handleCreate}>+ Crear Padre</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {parents.map(parent => (
                            <tr key={parent.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{parent.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parent.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <Button variant="secondary" className="text-xs" onClick={() => handleEdit(parent)}>Editar / Vincular Hijos</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <ParentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    user={selectedUser}
                />
            )}
        </>
    );
};

interface StudentsListTabProps {
    onDataChange: () => void;
    onNavigateToStudentForm: (studentId: string) => void;
}

const StudentsListTab: React.FC<StudentsListTabProps> = ({ onDataChange, onNavigateToStudentForm }) => {
    const { currentUser } = useAppContext();
    const [students, setStudents] = useState<Student[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [parents, setParents] = useState<User[]>([]);

    const fetchData = useCallback(async () => {
        if (currentUser?.schoolId) {
            const [studentsData, classroomsData, gradeLevelsData, parentsData] = await Promise.all([
                api.getStudentsBySchool(currentUser.schoolId),
                api.getClassroomsBySchool(currentUser.schoolId),
                api.getGradeLevelsBySchool(currentUser.schoolId),
                api.getParentsBySchool(currentUser.schoolId),
            ]);
            setStudents(studentsData);
            setClassrooms(classroomsData);
            setGradeLevels(gradeLevelsData);
            setParents(parentsData);
        }
    }, [currentUser?.schoolId]);


    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleSave = () => {
        fetchData();
        onDataChange();
        setIsModalOpen(false);
    }
    
    const handleShare = (student: Student) => {
        setSelectedStudent(student);
        setIsShareModalOpen(true);
    };

    const profileStatusColor = (status: 'Pending' | 'Complete'): 'yellow' | 'green' => {
        return status === 'Pending' ? 'yellow' : 'green';
    }

    const selectedParent = selectedStudent ? parents.find(p => p.id === selectedStudent.parentId) : null;

    return (
        <>
        <div className="flex justify-end mb-4">
            <Button onClick={() => setIsModalOpen(true)}>+ Crear Estudiante</Button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado del Perfil</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {students.map(student => {
                        return (
                        <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.gradeLevel}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Badge color={profileStatusColor(student.profileStatus)}>{student.profileStatus}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                {student.profileStatus === 'Pending' && (
                                    <Button variant="secondary" className="text-xs" onClick={() => handleShare(student)}>
                                        Compartir Formulario
                                    </Button>
                                )}
                                <Button variant="secondary" className="text-xs" onClick={() => onNavigateToStudentForm(student.id)}>
                                    Ver / Completar Perfil
                                </Button>
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
        {isModalOpen && (
            <StudentModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                classrooms={classrooms}
                gradeLevels={gradeLevels}
            />
        )}
        {isShareModalOpen && selectedStudent && (
            <ShareProfileModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                student={selectedStudent}
                parent={selectedParent || null}
            />
        )}
        </>
    );
};

type ParsedRow = { parentCedula: string, parentEmail: string, parentName: string, studentCedula: string, studentName: string, studentGrade: string };

const BulkImportTab: React.FC<{onImportSuccess: () => void}> = ({ onImportSuccess }) => {
    const { currentUser } = useAppContext();
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [importResult, setImportResult] = useState<{createdParents: number, createdStudents: number, errors: string[]}|null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    
    // Reference for clearing file input
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setParseError(null);
        setImportResult(null);
        setParsedData([]);
        
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            parseCSV(f);
        } else {
            setFile(null);
        }
    };

    const parseCSV = (csvFile: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            
            // Detect delimiter based on the header row (comma or semicolon)
            const separator = text.includes(';') ? ';' : ',';

            const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) {
                setParseError("El archivo no contiene suficientes filas (se requiere cabecera y datos).");
                return;
            }

            // Normalize headers
            const headers = lines[0].split(separator).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
            
            // Mapping Logic
            const mapHeader = (h: string) => {
                if (h.includes('nombre padre') || h.includes('parent name') || h.includes('parentname')) return 'parentName';
                if (h.includes('email') || h.includes('correo')) return 'parentEmail';
                if (h.includes('cedula padre') || h.includes('cédula padre') || h.includes('parent id') || h.includes('parentcedula')) return 'parentCedula';
                if (h.includes('nombre estudiante') || h.includes('student name') || h.includes('studentname')) return 'studentName';
                if (h.includes('cedula estudiante') || h.includes('cédula estudiante') || h.includes('student id') || h.includes('studentcedula')) return 'studentCedula';
                if (h.includes('grado') || h.includes('curso') || h.includes('grade') || h.includes('studentgrade')) return 'studentGrade';
                return null;
            };

            const headerKeys = headers.map(mapHeader);
            
            // Validate essential headers
            const required = ['parentName', 'parentEmail', 'studentName', 'studentGrade'];
            const missing = required.filter(r => !headerKeys.includes(r as any));
            
            if (missing.length > 0) {
                 setParseError(`Error en el formato: Faltan columnas requeridas (${missing.join(', ')}). Por favor descargue y use la plantilla actualizada.`);
                 return;
            }

            const data: ParsedRow[] = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(separator).map(v => v.trim().replace(/^"|"$/g, ''));
                // Basic check to ensure we have enough columns matching headers
                if (values.length < headerKeys.filter(k => k !== null).length) continue;

                const row: any = {};
                headerKeys.forEach((key, index) => {
                    if (key) row[key] = values[index] || '';
                });
                
                // Only add if essential data exists
                if (row.parentEmail && row.studentName) {
                    data.push(row as ParsedRow);
                }
            }

            if (data.length === 0) {
                setParseError("No se pudieron leer registros válidos. Verifique que el archivo no esté vacío y use el separador correcto (; o ,).");
            } else {
                setParsedData(data);
            }
        };
        reader.readAsText(csvFile);
    };

    const handleDownloadTemplate = () => {
        // Headers in Spanish for better UX
        const headers = "Nombre Padre,Email Padre,Cédula Padre,Nombre Estudiante,Cédula Estudiante,Grado";
        const exampleRow = "Juan Perez,juan@email.com,001-0000000-1,Pedrito Perez,402-0000000-2,1ro Primaria";
        const csvContent = headers + "\n" + exampleRow;
        
        // Add BOM for Excel UTF-8 compatibility (avoids weird characters)
        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "plantilla_padres_estudiantes.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = async () => {
        if (!currentUser?.schoolId || parsedData.length === 0) return;
        setIsProcessing(true);
        setImportResult(null);
        try {
            const result = await api.bulkImportParentsAndStudents(currentUser.schoolId, parsedData);
            setImportResult(result);
            if (result.errors.length === 0) {
              // Clear data after successful import to prevent double submission
              setParsedData([]);
              if (fileInputRef.current) fileInputRef.current.value = '';
              setTimeout(() => onImportSuccess(), 2000);
            }
        } catch (error) {
            setImportResult({ createdParents: 0, createdStudents: 0, errors: ['Ocurrió un error inesperado durante la importación.'] });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-4 border-dashed border-2 border-gray-300 rounded-lg text-center bg-gray-50">
                <h4 className="font-semibold text-lg text-gray-800">Paso 1: Descargar Plantilla</h4>
                <p className="text-sm text-gray-600 my-2 max-w-lg mx-auto">Descarga el archivo CSV compatible con Excel. Rellena los datos de los padres y estudiantes respetando las columnas.</p>
                <Button variant="secondary" onClick={handleDownloadTemplate}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Descargar Plantilla CSV
                </Button>
            </div>
            
            <div className="p-4 border-dashed border-2 border-blue-300 rounded-lg text-center bg-blue-50">
                <h4 className="font-semibold text-lg text-gray-800">Paso 2: Subir Archivo Completado</h4>
                <p className="text-sm text-gray-600 my-2">Sube tu archivo CSV. El sistema detectará automáticamente si usas comas o punto y coma.</p>
                <Input type="file" accept=".csv" onChange={handleFileChange} className="max-w-md mx-auto" ref={fileInputRef} />
                {parseError && (
                    <div className="mt-3 p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200">
                        <strong>Error:</strong> {parseError}
                    </div>
                )}
            </div>

            {parsedData.length > 0 && (
                <div className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-lg">Paso 3: Previsualizar y Confirmar</h4>
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                            {parsedData.length} registros detectados
                        </span>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto border rounded-lg mb-4">
                        <table className="min-w-full divide-y divide-gray-200 text-xs">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Nombre Padre</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Email</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Nombre Estudiante</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Grado</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Cédulas (P/E)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {parsedData.slice(0, 5).map((row, i) => (
                                    <tr key={i}>
                                        <td className="px-3 py-2 whitespace-nowrap">{row.parentName}</td>
                                        <td className="px-3 py-2 whitespace-nowrap">{row.parentEmail}</td>
                                        <td className="px-3 py-2 whitespace-nowrap">{row.studentName}</td>
                                        <td className="px-3 py-2 whitespace-nowrap">{row.studentGrade}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-gray-400">{row.parentCedula} / {row.studentCedula}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {parsedData.length > 5 && <p className="text-center text-xs p-2 bg-gray-50 text-gray-500 italic">... y {parsedData.length - 5} más.</p>}
                    </div>
                    
                    <div className="flex justify-end">
                        <Button 
                            onClick={handleImport} 
                            disabled={isProcessing} 
                            className="w-full sm:w-auto text-base py-2 px-6 bg-green-600 hover:bg-green-700"
                        >
                            {isProcessing ? 'Procesando...' : `Confirmar Importación`}
                        </Button>
                    </div>
                </div>
            )}
            
            {importResult && (
                <div className={`p-4 rounded-md mt-4 border ${importResult.errors.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <h4 className={`font-bold text-lg ${importResult.errors.length > 0 ? 'text-red-800' : 'text-green-800'}`}>
                        {importResult.errors.length > 0 ? 'Importación con Errores' : '¡Importación Exitosa!'}
                    </h4>
                    <div className="mt-2 text-sm space-y-1">
                        <p>Padres Creados: <strong>{importResult.createdParents}</strong></p>
                        <p>Estudiantes Creados: <strong>{importResult.createdStudents}</strong></p>
                    </div>
                    {importResult.errors.length > 0 && (
                        <div className="mt-3">
                            <p className="font-bold text-red-700 text-sm">Detalle de Errores:</p>
                            <ul className="list-disc list-inside text-xs text-red-600 max-h-32 overflow-y-auto mt-1 pl-1">
                                {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

interface ParentsAndStudentsViewProps {
    onNavigateToStudentForm: (studentId: string) => void;
}

export const ParentsAndStudentsView: React.FC<ParentsAndStudentsViewProps> = ({ onNavigateToStudentForm }) => {
    const [activeTab, setActiveTab] = useState<'parents' | 'students' | 'import'>('parents');
    const [refreshKey, setRefreshKey] = useState(0); // Used to trigger refetch in child components

    const handleDataChange = () => {
      // Force a refetch in the list tabs by changing their key
      setRefreshKey(prev => prev + 1);
    };

    const handleImportSuccess = () => {
      handleDataChange();
      // Optional: switch to parents tab after short delay
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Gestión de Padres y Estudiantes</h2>
                    <div className="flex border-b border-gray-200">
                        <button onClick={() => setActiveTab('parents')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'parents' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Padres
                        </button>
                        <button onClick={() => setActiveTab('students')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'students' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Estudiantes
                        </button>
                        <button onClick={() => setActiveTab('import')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'import' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Carga Masiva
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {activeTab === 'parents' && <ParentsListTab key={`parent-${refreshKey}`} onDataChange={handleDataChange} />}
                {activeTab === 'students' && <StudentsListTab key={`student-${refreshKey}`} onDataChange={handleDataChange} onNavigateToStudentForm={onNavigateToStudentForm} />}
                {activeTab === 'import' && <BulkImportTab onImportSuccess={handleImportSuccess} />}
            </CardContent>
        </Card>
    );
};