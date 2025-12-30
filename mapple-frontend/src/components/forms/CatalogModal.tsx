import React, { useState, useEffect } from 'react';
import type { Catalog, CatalogItem, Activity } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/mockApi';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  catalog: Catalog | null;
}

const initialItem: Omit<CatalogItem, 'id'> = { name: '', description: '', price: 0, imageUrl: '' };

export const CatalogModal: React.FC<CatalogModalProps> = ({ isOpen, onClose, onSave, catalog }) => {
  const { currentUser } = useAppContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [activityIds, setActivityIds] = useState<string[]>([]);
  const [availableActivities, setAvailableActivities] = useState<Activity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!catalog;

  useEffect(() => {
    if (isOpen && currentUser?.schoolId) {
        api.getActivitiesBySchool(currentUser.schoolId)
            .then(activities => {
                setAvailableActivities(activities.filter(a => a.visibility === 'Public'));
            });
    }

    if (catalog) {
      setName(catalog.name);
      setDescription(catalog.description);
      setItems(catalog.items.map(item => ({...item}))); // Create a copy to avoid direct mutation
      setActivityIds(catalog.activityIds || []);
    } else {
      setName('');
      setDescription('');
      setItems([]);
      setActivityIds([]);
    }
  }, [catalog, isOpen, currentUser?.schoolId]);

  const handleItemChange = (index: number, field: keyof Omit<CatalogItem, 'id'>, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleAddItem = () => {
    const newId = `temp-item-${Date.now()}`;
    setItems([...items, { id: newId, ...initialItem }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const handleActivityToggle = (id: string) => {
      setActivityIds(prev => 
          prev.includes(id) ? prev.filter(actId => actId !== id) : [...prev, id]
      );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.schoolId) return;

    setIsSubmitting(true);
    setError(null);

    const catalogData = {
        name,
        description,
        items: items.map(({id, ...rest}) => ({...rest, id: id.startsWith('temp-') ? '' : id})),
        activityIds,
        schoolId: currentUser.schoolId,
    };
    
    try {
      if (isEditing && catalog) {
        const updatedCatalog: Catalog = { ...catalog, ...catalogData };
        await api.updateCatalog(updatedCatalog);
      } else {
        const createData: Omit<Catalog, 'id'> = catalogData;
        await api.createCatalog(createData);
      }
      onSave();
    } catch (err) {
      setError('Failed to save catalog.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Programa' : 'Crear Nuevo Programa'}
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}
        <div>
          <Label htmlFor="catalogName">Nombre del Programa</Label>
          <Input id="catalogName" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="catalogDescription">Descripción</Label>
          <Textarea id="catalogDescription" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        
        <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold">Items del Programa</h4>
                <Button type="button" variant="secondary" onClick={handleAddItem}>+ Añadir Item</Button>
            </div>
            <div className="space-y-4 mt-4">
                {items.map((item, index) => (
                    <div key={item.id} className="p-4 border rounded-md bg-gray-50 relative">
                        <button type="button" onClick={() => handleRemoveItem(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-lg">&times;</button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <Label htmlFor={`item-name-${index}`}>Nombre</Label>
                                <Input id={`item-name-${index}`} value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor={`item-price-${index}`}>Precio ({currentUser?.schoolId === 'school-1' ? 'DOP' : 'USD'})</Label>
                                <Input id={`item-price-${index}`} type="number" value={item.price} onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)} required min="0" step="0.01"/>
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor={`item-desc-${index}`}>Descripción</Label>
                                <Input id={`item-desc-${index}`} value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor={`item-img-${index}`}>URL de Imagen</Label>
                                <Input id={`item-img-${index}`} value={item.imageUrl} onChange={e => handleItemChange(index, 'imageUrl', e.target.value)} />
                            </div>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <p className="text-sm text-gray-500 text-center">No hay items en este programa.</p>}
            </div>
        </div>

        <div className="pt-4 border-t">
            <h4 className="font-semibold">Actividades Públicas en el Programa</h4>
            <div className="space-y-2 mt-4 max-h-48 overflow-y-auto border rounded-md p-2">
                {availableActivities.length > 0 ? availableActivities.map(activity => (
                     <label key={activity.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={activityIds.includes(activity.id)}
                            onChange={() => handleActivityToggle(activity.id)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="font-medium text-sm text-gray-800">{activity.name}</span>
                    </label>
                )) : (
                    <p className="text-sm text-gray-500 text-center py-4">No hay actividades públicas para añadir.</p>
                )}
            </div>
        </div>

      </form>
    </Modal>
  );
};
