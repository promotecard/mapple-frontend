
import React, { useState, useEffect } from 'react';
import type { Student, VirtualTutorConfig } from '../../../types';
import { api } from '../../../services/mockApi';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';

interface VirtualTutorViewProps {
    student: Student;
}

const TutorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0m-7.072 0a5 5 0 010-7.072" /></svg>;

export const VirtualTutorView: React.FC<VirtualTutorViewProps> = ({ student }) => {
    const [config, setConfig] = useState<VirtualTutorConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getVirtualTutorConfig(student.schoolId)
            .then(data => {
                setConfig(data);
                setIsLoading(false);
            });
    }, [student.schoolId]);

    if (isLoading) return <p>Cargando configuración del tutor...</p>;

    if (!config || !config.isEnabled) {
        return (
            <div>
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-gray-600">La función de Tutor Virtual no está activada en este momento.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <Card>
                <CardContent className="p-8 flex flex-col items-center text-center">
                    <TutorIcon />
                    <p className="mt-6 text-gray-700 max-w-xl">
                        {config.welcomeMessage}
                    </p>
                    <a href={config.tutorUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="mt-8 text-lg px-8 py-3">
                            Acceder al Tutor
                        </Button>
                    </a>
                </CardContent>
            </Card>
        </div>
    );
};
