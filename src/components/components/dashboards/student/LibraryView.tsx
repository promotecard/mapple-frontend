import React, { useState, useEffect } from 'react';
import type { Student, LibraryItem } from '../../../types';
import { api } from '../../../services/mockApi';
import { Card, CardContent, CardHeader } from '../../ui/Card';

const FileTypeIcon: React.FC<{ type: LibraryItem['fileType'] }> = ({ type }) => {
    switch(type) {
        case 'pdf': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
        case 'video': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
        case 'doc': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
        case 'link': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
        default: return null;
    }
};

interface LibraryViewProps {
    student: Student;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ student }) => {
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getLibraryBySchool(student.schoolId)
            .then(data => {
                setItems(data.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                setIsLoading(false);
            });
    }, [student.schoolId]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Biblioteca de Recursos</h1>
            <Card>
                <CardContent>
                    {isLoading ? <p>Cargando recursos...</p> : (
                        <ul className="divide-y divide-gray-200">
                            {items.map(item => (
                                <li key={item.id} className="py-4">
                                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 group">
                                        <FileTypeIcon type={item.fileType} />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{item.title}</p>
                                            <p className="text-sm text-gray-600">{item.description}</p>
                                            <p className="text-xs text-gray-400 mt-1">Subido el {new Date(item.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
