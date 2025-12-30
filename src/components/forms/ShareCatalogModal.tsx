
import React, { useState } from 'react';
import type { Catalog } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

interface ShareCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: Catalog;
}

const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.099.164-1.157 4.224 4.272-1.124.167.105z" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const ExternalLinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;

export const ShareCatalogModal: React.FC<ShareCatalogModalProps> = ({ isOpen, onClose, catalog }) => {
    const [copied, setCopied] = useState(false);
    
    // Simulación de un enlace público al programa completo
    const publicUrl = `${window.location.origin}/public/program/${catalog.id}`;
    
    const shareText = `¡Hola! Te invitamos a conocer nuestro programa "${catalog.name}".
    
En este enlace podrás ver todas las actividades disponibles, horarios y precios, e inscribir a tus hijos directamente aunque no estén matriculados en el colegio:
    
${publicUrl}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const handleOpenPublicView = () => {
        // En una app real, esto abriría la ruta pública
        alert(`Simulación: Abriendo vista pública del catálogo "${catalog.name}" con ${catalog.items.length} items y actividades asociadas.`);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Compartir Programa: ${catalog.name}`}
            footer={<Button variant="secondary" onClick={onClose}>Cerrar</Button>}
        >
            <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                    <p className="text-sm text-blue-800">
                        <strong>Vista Pública:</strong> Este enlace permite a padres externos visualizar todas las actividades dentro de este programa como un catálogo y solicitar inscripción para sus hijos.
                    </p>
                </div>

                <div>
                    <Label htmlFor="share-link">Enlace público del Programa</Label>
                    <div className="flex items-center space-x-2">
                        <Input id="share-link" type="text" readOnly value={publicUrl} />
                        <Button variant={copied ? "primary" : "secondary"} onClick={handleCopy} className="w-28">
                            {copied ? <><CheckIcon /><span className="ml-2">Copiado</span></> : <><CopyIcon /><span className="ml-2">Copiar</span></>}
                        </Button>
                    </div>
                </div>

                <div>
                    <Label>Compartir</Label>
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
                            href={`mailto:?subject=${encodeURIComponent(`Programa de Actividades: ${catalog.name}`)}&body=${encodeURIComponent(shareText)}`}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-4 py-2 bg-gray-600 text-white hover:bg-gray-700"
                        >
                           <MailIcon /> <span className="ml-2">Email</span>
                        </a>
                        <Button variant="secondary" onClick={handleOpenPublicView}>
                            <ExternalLinkIcon /> <span className="ml-2">Ver como Público</span>
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
