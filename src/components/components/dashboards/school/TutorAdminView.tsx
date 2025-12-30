import React, { useState, useEffect } from 'react';
import type { VirtualTutorConfig } from '../../../types';
import { api } from '../../../services/mockApi';
import { useAppContext } from '../../../context/AppContext';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Textarea } from '../../ui/Textarea';

export const TutorAdminView: React.FC = () => {
    const { currentUser } = useAppContext();
    const [config, setConfig] = useState<Partial<VirtualTutorConfig>>({
        isEnabled: false,
        welcomeMessage: '',
        tutorUrl: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (currentUser?.schoolId) {
            setIsLoading(true);
            api.getVirtualTutorConfig(currentUser.schoolId)
                .then(data => {
                    if (data) setConfig(data);
                    setIsLoading(false);
                });
        }
    }, [currentUser?.schoolId]);

    const handleSave = async () => {
        if (!currentUser?.schoolId) return;
        setIsSaving(true);
        await api.updateVirtualTutorConfig(currentUser.schoolId, config as VirtualTutorConfig);
        setIsSaving(false);
        alert('Configuración guardada.');
    };

    if (isLoading) return <p>Cargando configuración...</p>;

    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-semibold">Configurar Tutor Virtual</h2>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <input
                        type="checkbox"
                        id="isEnabled"
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={config.isEnabled}
                        onChange={e => setConfig(c => ({ ...c, isEnabled: e.target.checked }))}
                    />
                    <Label htmlFor="isEnabled" className="text-lg font-medium mb-0">
                        Activar Tutor Virtual para Estudiantes
                    </Label>
                </div>
                
                <div>
                    <Label htmlFor="welcomeMessage">Mensaje de Bienvenida</Label>
                    <Textarea 
                        id="welcomeMessage"
                        rows={4}
                        placeholder="Ej: ¡Hola! Soy tu tutor virtual. Estoy aquí para ayudarte..."
                        value={config.welcomeMessage}
                        onChange={e => setConfig(c => ({ ...c, welcomeMessage: e.target.value }))}
                        disabled={!config.isEnabled}
                    />
                </div>

                <div>
                    <Label htmlFor="tutorUrl">URL del Tutor Externo</Label>
                    <Input 
                        id="tutorUrl"
                        type="url"
                        placeholder="https://www.khanacademy.org"
                        value={config.tutorUrl}
                        onChange={e => setConfig(c => ({ ...c, tutorUrl: e.target.value }))}
                        disabled={!config.isEnabled}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Este es el enlace al que serán dirigidos los estudiantes al hacer clic en "Acceder al Tutor".
                    </p>
                </div>
                
                <div className="text-right">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
