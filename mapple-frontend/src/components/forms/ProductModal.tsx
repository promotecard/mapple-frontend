
import React, { useState, useEffect, useRef } from 'react';
import type { Product } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/mockApi';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  product: Product | null;
}

const UploadIcon = () => (
    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product }) => {
    const { currentUser } = useAppContext();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        cost: 0,
        price: 0,
        stock: 0,
        imageUrl: ''
    });
    const [feePercentage, setFeePercentage] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditing = !!product;

    useEffect(() => {
        const loadData = async () => {
            if (currentUser?.providerId) {
                // 1. Load Fee Configuration
                // Check if provider has specific fee, otherwise use global
                const [globalFee, provider] = await Promise.all([
                    api.getFeeConfig(),
                    api.getProviderById(currentUser.providerId)
                ]);
                
                const effectiveFee = provider?.feeConfig 
                    ? provider.feeConfig.percentage 
                    : globalFee.percentage;
                
                setFeePercentage(effectiveFee);
            }
        };

        if (isOpen) {
            loadData();
            if (product) {
                setFormData({
                    name: product.name,
                    description: product.description,
                    cost: product.cost,
                    price: product.price,
                    stock: product.stock,
                    imageUrl: product.imageUrl,
                });
            } else {
                setFormData({ name: '', description: '', cost: 0, price: 0, stock: 0, imageUrl: '' });
            }
        }
    }, [product, isOpen, currentUser?.providerId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseFloat(value) || 0 : value 
        }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.providerId) return;

        setIsSubmitting(true);
        setError(null);

        const commonData = { ...formData, providerId: currentUser.providerId };

        try {
            if (isEditing && product) {
                await api.updateProduct({ ...product, ...commonData });
            } else {
                await api.createProduct(commonData);
            }
            onSave();
        } catch (err) {
            setError('Error al guardar el producto.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculations for display
    const feeAmount = formData.price * (feePercentage / 100);
    const netEarnings = formData.price - feeAmount;
    const profitMargin = netEarnings - formData.cost;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}
            closeOnOverlayClick={false}
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}
                
                <div>
                    <Label htmlFor="name">Nombre del Producto</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                
                <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
                </div>

                <div>
                    <Label>Imagen del Producto</Label>
                    <div
                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="space-y-1 text-center">
                        {formData.imageUrl ? (
                            <img src={formData.imageUrl} alt="Vista previa" className="mx-auto h-32 max-w-full object-contain rounded-md" />
                        ) : (
                            <>
                                <UploadIcon />
                                <span className="text-sm text-blue-600">Sube una foto</span>
                            </>
                        )}
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="cost">Costo (Interno)</Label>
                        <Input id="cost" name="cost" type="number" value={formData.cost} onChange={handleChange} required min="0" step="0.01" />
                    </div>
                    <div>
                        <Label htmlFor="price">Precio Final (Padres)</Label>
                        <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required min="0" step="0.01" />
                    </div>
                    <div>
                        <Label htmlFor="stock">Stock</Label>
                        <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} required min="0" />
                    </div>
                </div>

                {/* Fee Breakdown Section */}
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm space-y-1">
                    <div className="flex justify-between text-gray-600">
                        <span>Precio de Venta (Público):</span>
                        <span>${formData.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-500">
                        <span>Fee Plataforma ({feePercentage}%):</span>
                        <span>- ${feeAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-300 my-1"></div>
                    <div className="flex justify-between font-semibold text-gray-800">
                        <span>Tu Ingreso Neto:</span>
                        <span>${netEarnings.toFixed(2)}</span>
                    </div>
                    {formData.cost > 0 && (
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Margen Estimado (vs Costo):</span>
                            <span className={profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {profitMargin >= 0 ? '+' : ''}${profitMargin.toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>
            </form>
        </Modal>
    );
};
