
import React, { useState, useEffect } from 'react';
import type { ProviderCatalog, Product, School } from '../../types';
import { PaymentMethod } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/mockApi';

interface ProviderCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  catalog: ProviderCatalog | null;
  allProducts: Product[];
}

const today = new Date().toISOString().split('T')[0];

export const ProviderCatalogModal: React.FC<ProviderCatalogModalProps> = ({ isOpen, onClose, onSave, catalog, allProducts }) => {
    const { currentUser } = useAppContext();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        visibilityType: 'Permanent' as ProviderCatalog['visibilityType'],
        startDate: today,
        endDate: today,
        startTime: '08:00',
        endTime: '14:00',
        cutoffTime: '09:00',
        deliveryTime: '11:00',
    });
    const [productIds, setProductIds] = useState<string[]>([]);
    const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>([]);
    const [acceptedPaymentMethods, setAcceptedPaymentMethods] = useState<PaymentMethod[]>([]);
    const [schools, setSchools] = useState<School[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const isEditing = !!catalog;

    useEffect(() => {
        if (isOpen && currentUser?.providerId) {
            api.getSchoolsByProvider(currentUser.providerId).then(setSchools);
        }
        if (catalog) {
            setFormData({
                name: catalog.name,
                description: catalog.description,
                visibilityType: catalog.visibilityType,
                startDate: catalog.startDate || today,
                endDate: catalog.endDate || today,
                startTime: catalog.startTime || '08:00',
                endTime: catalog.endTime || '14:00',
                cutoffTime: catalog.cutoffTime || '09:00',
                deliveryTime: catalog.deliveryTime || '11:00',
            });
            setProductIds(catalog.productIds);
            setSelectedSchoolIds(catalog.schoolIds || []);
            setAcceptedPaymentMethods(catalog.acceptedPaymentMethods || [PaymentMethod.CreditCard, PaymentMethod.BankTransfer]);
        } else {
            setFormData({
                name: '',
                description: '',
                visibilityType: 'Permanent',
                startDate: today,
                endDate: today,
                startTime: '08:00',
                endTime: '14:00',
                cutoffTime: '09:00',
                deliveryTime: '11:00',
            });
            setProductIds([]);
            setSelectedSchoolIds([]);
            setAcceptedPaymentMethods([PaymentMethod.CreditCard, PaymentMethod.BankTransfer]); // Default
        }
    }, [catalog, isOpen, currentUser?.providerId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleVisibilityChange = (type: ProviderCatalog['visibilityType']) => {
        setFormData(prev => ({ ...prev, visibilityType: type }));
    };
    
    const handleProductMove = (id: string, direction: 'add' | 'remove') => {
        if (direction === 'add') {
            setProductIds(prev => [...prev, id]);
        } else {
            setProductIds(prev => prev.filter(pId => pId !== id));
        }
    };

    const handleSchoolIdToggle = (id: string) => {
        setSelectedSchoolIds(prev =>
            prev.includes(id) ? prev.filter(schoolId => schoolId !== id) : [...prev, id]
        );
    };

    const handlePaymentMethodToggle = (method: PaymentMethod) => {
        setAcceptedPaymentMethods(prev => 
            prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.providerId) return;

        setIsSubmitting(true);
        setError(null);

        const commonData = {
            providerId: currentUser.providerId,
            name: formData.name,
            description: formData.description,
            visibilityType: formData.visibilityType,
            productIds: productIds,
            schoolIds: selectedSchoolIds,
            acceptedPaymentMethods: acceptedPaymentMethods,
            startDate: formData.visibilityType === 'DateRange' ? formData.startDate : undefined,
            endDate: formData.visibilityType === 'DateRange' ? formData.endDate : undefined,
            startTime: formData.visibilityType === 'Scheduled' ? formData.startTime : undefined,
            endTime: formData.visibilityType === 'Scheduled' ? formData.endTime : undefined,
            cutoffTime: formData.cutoffTime,
            deliveryTime: formData.deliveryTime,
        };

        try {
            if (isEditing && catalog) {
                await api.updateProviderCatalog({ ...catalog, ...commonData });
            } else {
                await api.createProviderCatalog(commonData);
            }
            onSave();
        } catch (err) {
            setError('Error al guardar el catálogo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const availableProducts = allProducts
        .filter(p => !productIds.includes(p.id))
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
    const includedProducts = allProducts.filter(p => productIds.includes(p.id));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Editar Catálogo' : 'Crear Nuevo Catálogo'}
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar Catálogo'}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}
                <div><Label htmlFor="name">Nombre del Catálogo</Label><Input id="name" name="name" value={formData.name} onChange={handleChange} required /></div>
                <div><Label htmlFor="description">Descripción</Label><Textarea id="description" name="description" value={formData.description} onChange={handleChange} /></div>

                <div className="pt-4 border-t">
                    <Label>Visibilidad del Catálogo</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        <Button type="button" variant={formData.visibilityType === 'Permanent' ? 'primary' : 'secondary'} onClick={() => handleVisibilityChange('Permanent')}>Permanente</Button>
                        <Button type="button" variant={formData.visibilityType === 'DateRange' ? 'primary' : 'secondary'} onClick={() => handleVisibilityChange('DateRange')}>Rango de Fechas</Button>
                        <Button type="button" variant={formData.visibilityType === 'Scheduled' ? 'primary' : 'secondary'} onClick={() => handleVisibilityChange('Scheduled')}>Horario Específico</Button>
                    </div>

                    {formData.visibilityType === 'DateRange' && (
                        <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-md">
                            <div><Label>Fecha de Inicio</Label><Input type="date" name="startDate" value={formData.startDate} onChange={handleChange}/></div>
                            <div><Label>Fecha de Fin</Label><Input type="date" name="endDate" value={formData.endDate} onChange={handleChange}/></div>
                        </div>
                    )}
                    {formData.visibilityType === 'Scheduled' && (
                        <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-md">
                            <div><Label>Hora de Inicio</Label><Input type="time" name="startTime" value={formData.startTime} onChange={handleChange}/></div>
                            <div><Label>Hora de Fin</Label><Input type="time" name="endTime" value={formData.endTime} onChange={handleChange}/></div>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t">
                    <Label>Métodos de Pago Aceptados</Label>
                    <div className="flex gap-4 mt-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={acceptedPaymentMethods.includes(PaymentMethod.CreditCard)} 
                                onChange={() => handlePaymentMethodToggle(PaymentMethod.CreditCard)}
                                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <span>Tarjeta de Crédito</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={acceptedPaymentMethods.includes(PaymentMethod.BankTransfer)} 
                                onChange={() => handlePaymentMethodToggle(PaymentMethod.BankTransfer)}
                                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <span>Transferencia</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={acceptedPaymentMethods.includes(PaymentMethod.Cash)} 
                                onChange={() => handlePaymentMethodToggle(PaymentMethod.Cash)}
                                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <span>Efectivo (Contra Entrega)</span>
                        </label>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <Label>Visibilidad por Colegio</Label>
                    <p className="text-xs text-gray-500 mb-2">Seleccione los colegios que pueden ver este catálogo. Si no selecciona ninguno, será visible para todos los colegios vinculados.</p>
                    <div className="space-y-2 mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                        {schools.map(school => (
                            <label key={school.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedSchoolIds.includes(school.id)}
                                    onChange={() => handleSchoolIdToggle(school.id)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="font-medium text-sm text-gray-800">{school.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <Label>Horarios de Pedido y Entrega</Label>
                     <p className="text-xs text-gray-500 mb-2">Define un ciclo diario. Los pedidos recibidos antes de la hora de cierre se prepararán para la entrega en el horario especificado.</p>
                     <div className="grid grid-cols-2 gap-4 mt-2 p-4 bg-gray-50 rounded-md">
                        <div><Label>Hora de Cierre de Pedidos</Label><Input type="time" name="cutoffTime" value={formData.cutoffTime} onChange={handleChange}/></div>
                        <div><Label>Hora de Entrega</Label><Input type="time" name="deliveryTime" value={formData.deliveryTime} onChange={handleChange}/></div>
                    </div>
                </div>

                 <div className="pt-4 border-t">
                    <h4 className="font-semibold text-gray-800 mb-2">Productos del Catálogo</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Disponibles</Label>
                            <Input placeholder="Buscar producto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="mb-2" />
                            <div className="border rounded-md h-64 overflow-y-auto p-2 bg-gray-50">
                                {availableProducts.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-1.5 hover:bg-gray-100 rounded">
                                        <span className="text-sm">{p.name}</span>
                                        <button type="button" onClick={() => handleProductMove(p.id, 'add')} className="text-blue-500 font-bold text-lg">&rarr;</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label>Incluidos ({includedProducts.length})</Label>
                            <div className="border rounded-md h-64 overflow-y-auto p-2 bg-white mt-[38px]">
                                {includedProducts.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-1.5 hover:bg-gray-100 rounded">
                                        <button type="button" onClick={() => handleProductMove(p.id, 'remove')} className="text-red-500 font-bold text-lg">&larr;</button>
                                        <span className="text-sm">{p.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </form>
        </Modal>
    );
};
