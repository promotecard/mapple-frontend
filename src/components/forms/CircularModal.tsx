import React, { useState, useEffect } from 'react';
import type { Circular, CircularCreationData, GradeLevel } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/mockApi';

interface CircularModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  circular: Circular | null;
}

export const CircularModal: React.FC<CircularModalProps> = ({ isOpen, onClose, onSave, circular }) => {
  const { currentUser } = useAppContext();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetGroups, setTargetGroups] = useState<string[]>([]);
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!circular;

  useEffect(() => {
    if (isOpen && currentUser?.schoolId) {
        api.getGradeLevelsBySchool(currentUser.schoolId).then(setGradeLevels);
    }
    if (circular) {
      setTitle(circular.title);
      setContent(circular.content);
      setTargetGroups(circular.targetGroups);
    } else {
      setTitle('');
      setContent('');
      setTargetGroups(['all']); // Default to all
    }
  }, [circular, isOpen, currentUser?.schoolId]);

  const handleTargetGroupChange = (group: string) => {
    setTargetGroups(prev => {
        if (group === 'all') {
            return prev.includes('all') ? [] : ['all'];
        }
        const newGroups = prev.filter(g => g !== 'all');
        return newGroups.includes(group)
            ? newGroups.filter(g => g !== group)
            : [...newGroups, group];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.schoolId) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      const circularData: CircularCreationData = {
          title,
          content,
          targetGroups: targetGroups.length > 0 ? targetGroups : ['all'],
          schoolId: currentUser.schoolId,
      };

      if (isEditing && circular) {
        await api.updateCircular({ ...circular, ...circularData });
      } else {
        await api.createCircular(circularData);
      }
      onSave();
    } catch (err) {
      setError('Failed to save circular.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Circular' : 'Crear Nueva Circular'}
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}
        <div>
          <Label htmlFor="circularTitle">Título</Label>
          <Input id="circularTitle" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="circularContent">Contenido</Label>
          <Textarea id="circularContent" value={content} onChange={e => setContent(e.target.value)} rows={8} required />
        </div>
        <div>
            <Label>Enviar a:</Label>
            <div className="space-y-2 mt-2 border rounded-md p-3 max-h-48 overflow-y-auto">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                        type="checkbox"
                        checked={targetGroups.includes('all')}
                        onChange={() => handleTargetGroupChange('all')}
                        className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium">Todo el colegio</span>
                </label>
                <div className="border-t pt-2">
                    {gradeLevels.map(gl => (
                         <label key={gl.id} className="flex items-center space-x-2 cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={targetGroups.includes(gl.name)}
                                onChange={() => handleTargetGroupChange(gl.name)}
                                disabled={targetGroups.includes('all')}
                                className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <span className="text-sm">{gl.name}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
      </form>
    </Modal>
  );
};
