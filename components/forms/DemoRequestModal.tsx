import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/mockApi';

interface DemoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoRequestModal: React.FC<DemoRequestModalProps> = ({ isOpen, onClose }) => {
    const { landingPageConfig } = useAppContext();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [view, setView] = useState<'form' | 'success'>('form');

    const handleClose = () => {
        // Reset state before closing
        setEmail('');
        setMessage('');
        setIsSubmitting(false);
        setError('');
        setView('form');
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !landingPageConfig?.demoRequestEmail) {
            setError('Por favor, ingrese un correo válido.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await api.sendDemoRequest(email, message, landingPageConfig.demoRequestEmail);
            setView('success');
        } catch (err) {
            setError('No se pudo enviar la solicitud. Por favor, intente de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (view === 'success') {
        return (
            <Modal isOpen={isOpen} onClose={handleClose} title={t('demoRequest.successTitle')}>
                <div className="text-center p-6">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{t('demoRequest.successMessage')}</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        {t('demoRequest.successDescription')}
                    </p>
                    <Button onClick={handleClose} className="mt-4">
                        {t('demoRequest.close')}
                    </Button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={t('demoRequest.title')}
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={handleClose}>{t('demoRequest.cancel')}</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? t('demoRequest.submitting') : t('demoRequest.submit')}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}
                <p className="text-sm text-gray-600">
                    {t('demoRequest.description')}
                </p>
                <div>
                    <Label htmlFor="demo-email">{t('demoRequest.emailLabel')}</Label>
                    <Input
                        id="demo-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder={t('demoRequest.emailPlaceholder')}
                    />
                </div>
                <div>
                    <Label htmlFor="demo-message">{t('demoRequest.messageLabel')}</Label>
                    <Textarea
                        id="demo-message"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        rows={4}
                        placeholder={t('demoRequest.messagePlaceholder')}
                    />
                </div>
            </form>
        </Modal>
    );
};