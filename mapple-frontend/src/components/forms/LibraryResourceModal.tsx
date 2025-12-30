
import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { api } from '../../services/mockApi';
import { useAppContext } from '../../context/AppContext';
import type { LibraryItem } from '../../types';

interface LibraryResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

const UploadIcon = () => (
    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const LibraryResourceModal: React.FC<LibraryResourceModalProps> = ({ isOpen, onClose, onSave }) => {
    const { currentUser } = useAppContext();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fileType, setFileType] = useState<LibraryItem['fileType']>('pdf');
    const [url, setUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            
            // Validación de tamaño: 1MB (1024 * 1024 bytes)
            if (selectedFile.size > 1024 * 1024) { 
                setError('El archivo excede el límite permitido de 1MB.');
                setFile(null);
                // Resetear el input para permitir seleccionar otro archivo
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            setError(null);
            setFile(selectedFile);
        }
    };

    const handleSubmit = async () => {
        if (!currentUser?.schoolId) return;
        if (!title) {
            setError('El título es obligatorio');
            return;
        }
        
        let finalUrl = url;

        setIsSubmitting(true);
        setError(null);

        try {
            if (fileType !== 'link') {
                if (!file) {
                    setError('Debe subir un documento o archivo válido.');
                    setIsSubmitting(false);
                    return;
                }
                
                // Simulación de subida: Convertir archivo a base64
                const reader = new FileReader();
                reader.readAsDataURL(file);
                await new Promise((resolve, reject) => {
                    reader.onloadend = () => {
                        if (reader.result) {
                            finalUrl = reader.result as string;
                            resolve(null);
                        } else {
                            reject('Error al leer el archivo');
                        }
                    };
                    reader.onerror = () => reject('Error al leer el archivo');
                });
            } else {
                if (!url) {
                     setError('Debe ingresar una URL válida.');
                     setIsSubmitting(false);
                     return;
                }
            }

            await api.createLibraryItem({
                schoolId: currentUser.schoolId,
                title,
                description,
                fileType,
                fileUrl: finalUrl,
                uploadedBy: currentUser.id,
            });
            
            onSave();
            onClose();
        } catch (e) {
            console.error(e);
            setError('Ocurrió un error al guardar el recurso.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Añadir Recurso a la Biblioteca" footer={
            <div className="space-x-2">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar Recurso'}</Button>
            </div>
        }>
             <div className="space-y-4">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">{error}</div>}
                
                <div>
                    <Label htmlFor="title">Título del Recurso</Label>
                    <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Guía de Matemáticas" required />
                </div>

                <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Breve descripción del contenido..." />
                </div>

                <div>
                    <Label htmlFor="fileType">Tipo de Recurso</Label>
                    <Select id="fileType" value={fileType} onChange={e => setFileType(e.target.value as LibraryItem['fileType'])}>
                        <option value="pdf">Documento PDF</option>
                        <option value="doc">Documento Word/Doc</option>
                        <option value="video">Video</option>
                        <option value="link">Enlace Externo</option>
                    </Select>
                </div>

                {fileType === 'link' ? (
                    <div>
                        <Label htmlFor="url">Enlace (URL)</Label>
                        <Input id="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
                    </div>
                ) : (
                    <div>
                        <Label>Subir Documento (Máx. 1MB)</Label>
                        <div
                            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500 bg-gray-50"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="space-y-1 text-center">
                                {file ? (
                                    <div className="text-green-600 font-medium flex flex-col items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{file.name}</span>
                                        <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                    </div>
                                ) : (
                                    <>
                                        <UploadIcon />
                                        <div className="flex text-sm text-gray-600">
                                            <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                <span>Seleccionar archivo</span>
                                            </span>
                                            <p className="pl-1">o arrastrar aquí</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PDF, DOC, MP4 hasta 1MB</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            // accept=".pdf,.doc,.docx,.mp4" // Opcional: restringir tipos en el selector
                            onChange={handleFileChange}
                        />
                    </div>
                )}
             </div>
        </Modal>
    );
}
