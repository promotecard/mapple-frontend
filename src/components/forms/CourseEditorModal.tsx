
import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { api } from '../../services/mockApi';
import { useAppContext } from '../../context/AppContext';
import type { Course, CourseModule, LessonContent, Exam, Question, User } from '../../types';

interface CourseEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    course: Course | null;
}

const initialCourseState: Omit<Course, 'id' | 'schoolId'> = {
    title: '',
    shortDescription: '',
    longDescription: '',
    category: '',
    level: 'Basic',
    imageUrl: '',
    language: 'Español',
    hasCertificate: true,
    minScore: 70,
    allowComments: true,
    status: 'Inactive',
    isPaid: false,
    targetGradeLevels: [],
    modules: [],
};

const initialExamState: Exam = {
    id: '',
    title: 'Examen Final',
    description: '',
    questions: [],
    timeLimitMinutes: 60,
    maxAttempts: 3,
    minScoreToPass: 70,
    evaluationScope: 'course_general'
};

export const CourseEditorModal: React.FC<CourseEditorModalProps> = ({ isOpen, onClose, onSave, course }) => {
    const { currentUser } = useAppContext();
    const [activeTab, setActiveTab] = useState<'general' | 'curriculum' | 'exam'>('general');
    const [formData, setFormData] = useState<any>(initialCourseState);
    const [modules, setModules] = useState<CourseModule[]>([]);
    const [exam, setExam] = useState<Exam>(initialExamState);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Module Editing State
    const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(null);
    const [moduleName, setModuleName] = useState('');
    const [moduleDesc, setModuleDesc] = useState('');

    // Content Editing State
    const [editingContentIndex, setEditingContentIndex] = useState<number | null>(null); // [moduleIndex, contentIndex] logic needed
    const [activeModuleIdForContent, setActiveModuleIdForContent] = useState<string | null>(null);
    const [contentData, setContentData] = useState<LessonContent>({ id: '', type: 'text', title: '', data: '' });
    const [showContentForm, setShowContentForm] = useState(false);

    // Question Editing State
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [questionData, setQuestionData] = useState<Question>({ id: '', text: '', type: 'multiple_choice', points: 10, correctAnswer: '' });

    useEffect(() => {
        if (isOpen && currentUser?.schoolId) {
            api.getStaffBySchool(currentUser.schoolId).then(setTeachers);
        }

        if (course) {
            setFormData({ ...course });
            setModules(course.modules || []);
            setExam(course.finalExam || { ...initialExamState, id: `exam-${Date.now()}` });
        } else {
            setFormData(initialCourseState);
            setModules([]);
            setExam({ ...initialExamState, id: `exam-${Date.now()}` });
        }
    }, [course, isOpen, currentUser?.schoolId]);

    // --- General Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 1024 * 1024) {
                alert("La imagen no puede superar 1MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev: any) => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Module Handlers ---
    const handleAddModule = () => {
        const newModule: CourseModule = {
            id: `mod-${Date.now()}`,
            title: 'Nuevo Módulo',
            description: '',
            contents: []
        };
        setModules([...modules, newModule]);
        setEditingModuleIndex(modules.length);
        setModuleName(newModule.title);
        setModuleDesc(newModule.description);
    };

    const handleSaveModule = () => {
        if (editingModuleIndex === null) return;
        const updatedModules = [...modules];
        updatedModules[editingModuleIndex] = {
            ...updatedModules[editingModuleIndex],
            title: moduleName,
            description: moduleDesc
        };
        setModules(updatedModules);
        setEditingModuleIndex(null);
    };

    const handleDeleteModule = (index: number) => {
        const updated = modules.filter((_, i) => i !== index);
        setModules(updated);
    };

    // --- Content Handlers ---
    const openContentForm = (moduleId: string) => {
        setActiveModuleIdForContent(moduleId);
        setContentData({ id: '', type: 'text', title: '', data: '' });
        setShowContentForm(true);
    };

    const handleSaveContent = () => {
        if (!activeModuleIdForContent) return;
        
        const updatedModules = modules.map(mod => {
            if (mod.id === activeModuleIdForContent) {
                return {
                    ...mod,
                    contents: [...mod.contents, { ...contentData, id: `cnt-${Date.now()}` }]
                };
            }
            return mod;
        });
        setModules(updatedModules);
        setShowContentForm(false);
    };

    const handleContentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
         if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 1024 * 1024) {
                alert("El archivo no puede superar 1MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setContentData(prev => ({ ...prev, data: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Exam Handlers ---
    const handleAddQuestion = () => {
        setExam(prev => ({
            ...prev,
            questions: [...prev.questions, { ...questionData, id: `q-${Date.now()}` }]
        }));
        setShowQuestionForm(false);
        setQuestionData({ id: '', text: '', type: 'multiple_choice', points: 10, correctAnswer: '' });
    };

    const handleSaveCourse = async () => {
        if (!currentUser?.schoolId) return;
        setIsSubmitting(true);

        const finalCourseData = {
            ...formData,
            modules,
            finalExam: exam,
            schoolId: currentUser.schoolId,
            minScore: Number(formData.minScore),
            price: Number(formData.price)
        };

        try {
            if (course) {
                await api.updateCourse({ ...course, ...finalCourseData });
            } else {
                await api.createCourse(finalCourseData);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Error al guardar el curso.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={course ? `Editar Curso: ${course.title}` : "Crear Nuevo Curso"}
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSaveCourse} disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar Curso'}</Button>
                </div>
            }
        >
            <div className="flex border-b mb-4">
                <button onClick={() => setActiveTab('general')} className={`px-4 py-2 ${activeTab === 'general' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>General</button>
                <button onClick={() => setActiveTab('curriculum')} className={`px-4 py-2 ${activeTab === 'curriculum' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Plan de Estudios</button>
                <button onClick={() => setActiveTab('exam')} className={`px-4 py-2 ${activeTab === 'exam' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Evaluación</button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-1">
                {activeTab === 'general' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Título del Curso</Label><Input name="title" value={formData.title} onChange={handleChange} /></div>
                            <div><Label>Categoría</Label><Input name="category" value={formData.category} onChange={handleChange} placeholder="Ej: Matemáticas" /></div>
                        </div>
                        <div><Label>Descripción Breve (máx 500)</Label><Textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={2} maxLength={500} /></div>
                        <div><Label>Descripción Extendida</Label><Textarea name="longDescription" value={formData.longDescription} onChange={handleChange} rows={4} /></div>
                        
                        <div className="grid grid-cols-3 gap-4">
                             <div>
                                <Label>Nivel</Label>
                                <Select name="level" value={formData.level} onChange={handleChange}>
                                    <option value="Basic">Básico</option>
                                    <option value="Intermediate">Intermedio</option>
                                    <option value="Advanced">Avanzado</option>
                                </Select>
                            </div>
                            <div><Label>Idioma</Label><Input name="language" value={formData.language} onChange={handleChange} /></div>
                            <div>
                                <Label>Instructor</Label>
                                <Select name="instructorId" value={formData.instructorId} onChange={handleChange}>
                                    <option value="">Seleccionar...</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div><Label>Imagen Destacada (max 1MB)</Label><Input type="file" accept="image/*" onChange={handleImageUpload} /></div>
                             <div className="flex items-center space-x-4 pt-6">
                                <label className="flex items-center"><input type="checkbox" name="hasCertificate" checked={formData.hasCertificate} onChange={handleChange} className="mr-2" /> Certificado</label>
                                <label className="flex items-center"><input type="checkbox" name="allowComments" checked={formData.allowComments} onChange={handleChange} className="mr-2" /> Comentarios</label>
                             </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div><Label>Estado</Label><Select name="status" value={formData.status} onChange={handleChange}><option value="Active">Activo</option><option value="Inactive">Inactivo</option></Select></div>
                            <div><Label>Costo</Label><Select value={formData.isPaid ? 'Paid' : 'Free'} onChange={e => setFormData({...formData, isPaid: e.target.value === 'Paid'})}><option value="Free">Gratis</option><option value="Paid">Pago</option></Select></div>
                            {formData.isPaid && <div><Label>Precio</Label><Input type="number" name="price" value={formData.price} onChange={handleChange} /></div>}
                        </div>
                    </div>
                )}

                {activeTab === 'curriculum' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Módulos ({modules.length})</h3>
                            <Button size="sm" onClick={handleAddModule}>+ Añadir Módulo</Button>
                        </div>
                        
                        {modules.map((mod, idx) => (
                            <div key={mod.id} className="border rounded-md p-4 bg-gray-50">
                                {editingModuleIndex === idx ? (
                                    <div className="space-y-2 mb-2">
                                        <Input value={moduleName} onChange={e => setModuleName(e.target.value)} placeholder="Nombre del módulo" />
                                        <Input value={moduleDesc} onChange={e => setModuleDesc(e.target.value)} placeholder="Descripción" />
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={handleSaveModule}>Guardar Cambios</Button>
                                            <Button size="sm" variant="secondary" onClick={() => setEditingModuleIndex(null)}>Cancelar</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold">{mod.title}</h4>
                                            <p className="text-sm text-gray-600">{mod.description}</p>
                                        </div>
                                        <div className="space-x-2">
                                            <Button size="sm" variant="secondary" onClick={() => { setEditingModuleIndex(idx); setModuleName(mod.title); setModuleDesc(mod.description); }}>Editar</Button>
                                            <Button size="sm" variant="danger" onClick={() => handleDeleteModule(idx)}>X</Button>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="mt-4 pl-4 border-l-2 border-gray-300">
                                    <h5 className="text-xs font-bold uppercase text-gray-500 mb-2">Contenido del Módulo</h5>
                                    <ul className="space-y-1 mb-3">
                                        {mod.contents.map(c => (
                                            <li key={c.id} className="text-sm flex items-center gap-2">
                                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">{c.type}</span>
                                                {c.title}
                                            </li>
                                        ))}
                                        {mod.contents.length === 0 && <li className="text-sm text-gray-400 italic">Sin contenido</li>}
                                    </ul>
                                    <Button size="sm" variant="secondary" className="text-xs" onClick={() => openContentForm(mod.id)}>+ Agregar Contenido</Button>
                                </div>
                            </div>
                        ))}

                        {showContentForm && (
                            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                                    <h4 className="font-bold mb-4">Nuevo Contenido</h4>
                                    <div className="space-y-3">
                                        <div><Label>Título</Label><Input value={contentData.title} onChange={e => setContentData({...contentData, title: e.target.value})} /></div>
                                        <div>
                                            <Label>Tipo</Label>
                                            <Select value={contentData.type} onChange={e => setContentData({...contentData, type: e.target.value as any})}>
                                                <option value="text">Texto / Lectura</option>
                                                <option value="video_embed">Video (YouTube/Vimeo)</option>
                                                <option value="video_upload">Subir Video (MP4)</option>
                                                <option value="file">Archivo Adjunto (PDF/PPT)</option>
                                                <option value="link">Enlace Externo</option>
                                            </Select>
                                        </div>
                                        
                                        {contentData.type === 'file' || contentData.type === 'video_upload' ? (
                                            <div>
                                                <Label>{contentData.type === 'video_upload' ? 'Video (MP4, max 1MB)' : 'Archivo (max 1MB)'}</Label>
                                                <Input 
                                                    type="file" 
                                                    accept={contentData.type === 'video_upload' ? 'video/mp4,video/x-m4v,video/*' : '*/*'}
                                                    onChange={handleContentFileUpload} 
                                                />
                                            </div>
                                        ) : (
                                            <div><Label>{contentData.type === 'video_embed' ? 'URL del Video' : 'Contenido / URL'}</Label><Textarea value={contentData.data} onChange={e => setContentData({...contentData, data: e.target.value})} /></div>
                                        )}

                                        <div className="flex justify-end gap-2 pt-2">
                                            <Button size="sm" variant="secondary" onClick={() => setShowContentForm(false)}>Cancelar</Button>
                                            <Button size="sm" onClick={handleSaveContent}>Agregar</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'exam' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded">
                             <div className="col-span-2 grid grid-cols-3 gap-4">
                                <div><Label>Tiempo Límite (min)</Label><Input type="number" value={exam.timeLimitMinutes} onChange={e => setExam({...exam, timeLimitMinutes: Number(e.target.value)})} /></div>
                                <div><Label>Intentos Permitidos</Label><Input type="number" value={exam.maxAttempts} onChange={e => setExam({...exam, maxAttempts: Number(e.target.value)})} /></div>
                                <div><Label>Puntaje Mínimo</Label><Input type="number" value={exam.minScoreToPass} onChange={e => setExam({...exam, minScoreToPass: Number(e.target.value)})} /></div>
                             </div>
                             <div className="col-span-2">
                                <Label>Qué mide esta evaluación</Label>
                                <Select 
                                    value={exam.evaluationScope} 
                                    onChange={e => setExam({...exam, evaluationScope: e.target.value as any})}
                                >
                                    <option value="course_general">Conocimiento general del curso</option>
                                    <option value="module_specific">Conocimiento por cada sección completada</option>
                                </Select>
                             </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Preguntas ({exam.questions.length})</h3>
                            <Button size="sm" onClick={() => setShowQuestionForm(true)}>+ Añadir Pregunta</Button>
                        </div>

                        <ul className="space-y-2">
                            {exam.questions.map((q, i) => (
                                <li key={q.id} className="p-3 border rounded flex justify-between">
                                    <div>
                                        <span className="font-bold mr-2">{i + 1}.</span>
                                        {q.text} <span className="text-xs text-gray-500">({q.points} pts)</span>
                                    </div>
                                    <Button size="sm" variant="danger" onClick={() => setExam(prev => ({...prev, questions: prev.questions.filter(qx => qx.id !== q.id)}))}>X</Button>
                                </li>
                            ))}
                        </ul>

                        {showQuestionForm && (
                             <div className="border p-4 rounded bg-gray-50 space-y-3 mt-4">
                                <div><Label>Texto de la Pregunta</Label><Input value={questionData.text} onChange={e => setQuestionData({...questionData, text: e.target.value})} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Tipo</Label>
                                        <Select value={questionData.type} onChange={e => setQuestionData({...questionData, type: e.target.value as any})}>
                                            <option value="multiple_choice">Opción Múltiple</option>
                                            <option value="true_false">Falso / Verdadero</option>
                                            <option value="short_answer">Respuesta Corta</option>
                                        </Select>
                                    </div>
                                    <div><Label>Puntos</Label><Input type="number" value={questionData.points} onChange={e => setQuestionData({...questionData, points: Number(e.target.value)})} /></div>
                                </div>
                                
                                {questionData.type === 'multiple_choice' && (
                                    <div>
                                        <Label>Opciones (separadas por coma)</Label>
                                        <Input placeholder="Opción A, Opción B, Opción C" onChange={e => setQuestionData({...questionData, options: e.target.value.split(',').map(s => s.trim())})} />
                                    </div>
                                )}
                                
                                <div><Label>Respuesta Correcta</Label><Input value={questionData.correctAnswer as string} onChange={e => setQuestionData({...questionData, correctAnswer: e.target.value})} placeholder={questionData.type === 'true_false' ? 'true o false' : 'Texto exacto'} /></div>

                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="secondary" onClick={() => setShowQuestionForm(false)}>Cancelar</Button>
                                    <Button size="sm" onClick={handleAddQuestion}>Guardar Pregunta</Button>
                                </div>
                             </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};
