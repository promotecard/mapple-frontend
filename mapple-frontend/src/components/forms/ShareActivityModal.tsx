import React, { useState } from 'react';
import type { Activity } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

interface ShareActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity;
}

const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.099.164-1.157 4.224 4.272-1.124.167.105z" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;


export const ShareActivityModal: React.FC<ShareActivityModalProps> = ({ isOpen, onClose, activity }) => {
    const [copied, setCopied] = useState(false);
    
    const fullUrl = `${window.location.origin}${activity.publicRegistrationLink || ''}`;
    const date = new Date(activity.startDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const shareText = `¡Hola! Te invito a la actividad "${activity.name}" que se realizará el ${date}. ¡No te la pierdas! Más información y registro aquí: ${fullUrl}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const handleInternalNotification = () => {
        alert(`Simulación: Se ha enviado una notificación sobre la actividad "${activity.name}" a los padres de los cursos: ${activity.participatingLevels.join(', ')}.`);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Compartir Actividad: ${activity.name}`}
            footer={<Button variant="secondary" onClick={onClose}>Cerrar</Button>}
        >
            <div className="space-y-6">
                <div>
                    <Label htmlFor="share-link">Enlace público de inscripción</Label>
                    <div className="flex items-center space-x-2">
                        <Input id="share-link" type="text" readOnly value={fullUrl} />
                        <Button variant={copied ? "primary" : "secondary"} onClick={handleCopy} className="w-28">
                            {copied ? <><CheckIcon /><span className="ml-2">Copiado</span></> : <><CopyIcon /><span className="ml-2">Copiar</span></>}
                        </Button>
                    </div>
                </div>

                <div>
                    <Label>Otras opciones para compartir</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                        <a 
                            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-4 py-2 bg-green-500 text-white hover:bg-green-600"
                        >
                           <WhatsAppIcon /> <span className="ml-2">WhatsApp</span>
                        </a>
                         <a 
                            href={`mailto:?subject=${encodeURIComponent(`Invitación: ${activity.name}`)}&body=${encodeURIComponent(shareText)}`}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-4 py-2 bg-gray-600 text-white hover:bg-gray-700"
                        >
                           <MailIcon /> <span className="ml-2">Email</span>
                        </a>
                        <Button variant="primary" onClick={handleInternalNotification}>
                            <BellIcon /> <span className="ml-2">Notificación Interna</span>
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};