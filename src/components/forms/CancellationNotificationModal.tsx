import React, { useState, useEffect } from 'react';
import type { Activity, EmailTemplate } from '../../types';
import { EmailTemplateType } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { api } from '../../services/mockApi';

interface CancellationNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSend: (customMessage: string) => void;
  activity: Activity;
  isSending: boolean;
}

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

export const CancellationNotificationModal: React.FC<CancellationNotificationModalProps> = ({ isOpen, onClose, onConfirmSend, activity, isSending }) => {
    const [template, setTemplate] = useState<EmailTemplate | null>(null);
    const [customMessage, setCustomMessage] = useState('');
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setIsLoadingTemplate(true);
            api.getEmailTemplates()
                .then(templates => {
                    const cancellationTemplate = templates.find(t => t.type === EmailTemplateType.ActivityCancellation);
                    setTemplate(cancellationTemplate || null);
                })
                .finally(() => setIsLoadingTemplate(false));
        }
    }, [isOpen]);
    
    const handleConfirm = () => {
        onConfirmSend(customMessage);
    };

    const getPreviewBody = () => {
        if (!template) return "Plantilla no encontrada.";
        let body = template.body
            .replace(/{{activityName}}/g, `"${activity.name}"`)
            .replace(/{{parentName}}/g, '(Nombre del Padre/Madre)')
            .replace(/{{studentName}}/g, '(Nombre del Estudiante)')
            .replace(/{{schoolName}}/g, '(Nombre del Colegio)');

        if (customMessage) {
            body += `\n\n--- Mensaje Adicional ---\n${customMessage}`;
        }
        return body;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Confirmar Cancelación y Notificar"
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose} disabled={isSending}>Cancelar</Button>
                    <Button variant="danger" onClick={handleConfirm} disabled={isSending}>
                        {isSending ? 'Enviando...' : 'Confirmar y Enviar Notificación'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md flex items-start space-x-3">
                    <InfoIcon />
                    <p className="text-sm text-blue-700">
                        Estás a punto de cambiar el estado de la actividad a <strong>Cancelada</strong>. Se enviará una notificación a los padres de los <strong>{activity.enrolledStudentIds.length}</strong> estudiante(s) inscrito(s).
                    </p>
                </div>

                <div>
                    <Label>Vista Previa del Mensaje</Label>
                    <div className="p-3 bg-gray-100 rounded-md border max-h-48 overflow-y-auto">
                        {isLoadingTemplate ? (
                            <p className="text-sm text-gray-500">Cargando plantilla...</p>
                        ) : (
                            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">{getPreviewBody()}</pre>
                        )}
                    </div>
                </div>

                <div>
                    <Label htmlFor="customMessage">Añadir mensaje personalizado (Opcional)</Label>
                    <Textarea
                        id="customMessage"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        rows={3}
                        placeholder="Ej: Se ofrecerá un reembolso completo. Nos pondremos en contacto pronto."
                    />
                </div>
            </div>
        </Modal>
    );
};
