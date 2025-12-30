
import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import type { PaymentTransaction } from '../../types';
import { PaymentMethod } from '../../types';
import { api } from '../../services/mockApi';

interface ReportPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    transaction: PaymentTransaction;
}

const UploadIcon = () => (
    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ReportPaymentModal: React.FC<ReportPaymentModalProps> = ({ isOpen, onClose, onSuccess, transaction }) => {
    const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.BankTransfer);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // Validate size (1MB = 1048576 bytes)
            if (selectedFile.size > 1024 * 1024) {
                alert("El archivo es demasiado grande. El tamaño máximo permitido es 1MB.");
                // Reset input
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            setFile(selectedFile);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async () => {
        if (!file || !previewUrl) {
            alert("Por favor suba una imagen del comprobante.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Use transaction.id directly
            // This will set the status to 'ProofUploaded', making it pending for admin confirmation
            // Also update the method to ensure admin sees if it was Cash/Deposit or Transfer
            await api.uploadPaymentProof(transaction.id, previewUrl, method);
            
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Error al subir el comprobante.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Reportar Pago Realizado"
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !file}>
                        {isSubmitting ? 'Enviando...' : 'Enviar Comprobante'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-sm text-gray-500">Concepto a Pagar</p>
                    <p className="font-bold text-gray-800 text-lg">{transaction.concept}</p>
                    <p className="text-blue-700 font-bold mt-1 text-xl">${transaction.amount.toFixed(2)} <span className="text-sm font-normal">{transaction.currency}</span></p>
                </div>

                <div>
                    <Label>Método Utilizado</Label>
                    <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                        <option value={PaymentMethod.BankTransfer}>Transferencia Bancaria</option>
                        <option value={PaymentMethod.Cash}>Depósito en Efectivo</option>
                    </Select>
                </div>

                <div>
                    <Label>Comprobante de Pago (Foto o PDF) - <span className="text-red-500">Máx 1MB</span></Label>
                    <div
                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500 bg-gray-50"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="space-y-1 text-center">
                            {previewUrl ? (
                                <div className="relative">
                                    <img src={previewUrl} alt="Vista previa" className="mx-auto h-40 object-contain rounded-md shadow-sm" />
                                    <p className="text-xs text-gray-500 mt-2">{file?.name}</p>
                                    <p className="text-xs text-blue-600 font-medium">Clic para cambiar</p>
                                </div>
                            ) : (
                                <>
                                    <UploadIcon />
                                    <div className="flex text-sm text-gray-600">
                                        <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                            <span>Subir archivo</span>
                                        </span>
                                        <p className="pl-1">o arrastrar y soltar</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, PDF hasta 1MB</p>
                                </>
                            )}
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="sr-only"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                    />
                </div>

                <div>
                    <Label>Notas / Referencia (Opcional)</Label>
                    <Textarea 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        placeholder="Ej: Pago realizado desde Banco Popular, Ref #123456"
                        rows={2}
                    />
                </div>
            </div>
        </Modal>
    );
};
