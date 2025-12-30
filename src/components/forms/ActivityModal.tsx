
import React, { useState, useEffect, useRef } from 'react';
import type { Activity, ActivityCreationData, User, ActivityAssignment, GradeLevel } from '../../types';
import { Status, Role, PaymentMethod } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../services/mockApi';
import { CancellationNotificationModal } from './CancellationNotificationModal';
import { DateTimePicker } from '../ui/DateTimePicker';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  activity: Activity | null;
}

const initialState: Omit<ActivityCreationData, 'schoolId' | 'assignments'> = {
  name: '',
  description: '',
  imageUrl: '',
  startDate: '',
  endDate: '',
  maxCapacity: 50,
  cost: 0,
  currency: 'DOP',
  acceptedPaymentMethods: [],
  responsiblePerson: '',
  participatingLevels: [],
  status: Status.Pending,
  visibility: 'Public',
  requiresAssistanceRegistration: false,
};

const UploadIcon = () => (
    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);


export const ActivityModal: React.FC<ActivityModalProps> = ({ isOpen, onClose, onSave, activity }) => {
  const { currentUser } = useAppContext();
  const [formData, setFormData] = useState(initialState);
  const [assignments, setAssignments] = useState<ActivityAssignment[]>([]);
  const [parents, setParents] = useState<User[]>([]);
  const [availableGradeLevels, setAvailableGradeLevels] = useState<GradeLevel[]>([]);
  const [newAssignmentDesc, setNewAssignmentDesc] = useState('');
  const [newAssignmentParentId, setNewAssignmentParentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);

  const isEditing = !!activity;

  useEffect(() => {
    if (isOpen) {
        if (currentUser?.schoolId) {
            // Fetch parents
            api.getParentsBySchool(currentUser.schoolId)
              .then(users => {
                setParents(users);
              });
            
            // Fetch dynamic grade levels
            api.getGradeLevelsBySchool(currentUser.schoolId)
                .then(grades => {
                    setAvailableGradeLevels(grades);
                });
        }

        if (activity) {
            setFormData({
                ...activity,
                startDate: activity.startDate.substring(0, 16), // Format for datetime-local like string
                endDate: activity.endDate.substring(0, 16),
            });
            setAssignments(activity.assignments || []);
        } else {
            setFormData(initialState);
            setAssignments([]);
        }
    }
  }, [activity, isOpen, currentUser?.schoolId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        if (name === 'paymentMethods') {
             const method = value as PaymentMethod;
             let newMethods = [...formData.acceptedPaymentMethods];
             if (checked) {
                 newMethods.push(method);
             } else {
                 newMethods = newMethods.filter(m => m !== method);
             }
             setFormData(prev => ({ ...prev, acceptedPaymentMethods: newMethods }));
        } else if (name === 'selectAllPaymentMethods') {
            setFormData(prev => ({ ...prev, acceptedPaymentMethods: checked ? Object.values(PaymentMethod) : [] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: checked }));
        }
    } else if (name === 'participatingLevels') {
        const options = (e.target as HTMLSelectElement).options;
        const selectedLevels: string[] = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                selectedLevels.push(options[i].value);
            }
        }
        setFormData(prev => ({ ...prev, participatingLevels: selectedLevels }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleDateChange = (name: string, value: string) => {
      setFormData(prev => ({ ...prev, [name]: value }));
  };
  
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAssignment = () => {
    if (!newAssignmentDesc || !newAssignmentParentId) {
        alert('Por favor, complete la descripción y seleccione un padre.');
        return;
    }
    const newAssignment: ActivityAssignment = {
        id: `assign-${Date.now()}`, // Temporary ID
        description: newAssignmentDesc,
        assignedParentId: newAssignmentParentId,
    };
    setAssignments(prev => [...prev, newAssignment]);
    setNewAssignmentDesc('');
    setNewAssignmentParentId('');
  };

  const handleRemoveAssignment = (id: string) => {
      setAssignments(prev => prev.filter(a => a.id !== id));
  };
  
  const performSave = async () => {
      if (!currentUser?.schoolId) return;

      const commonData = {
          ...formData,
          cost: Number(formData.cost),
          maxCapacity: Number(formData.maxCapacity),
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          assignments: assignments,
      };
      
      if (isEditing && activity) {
          const updatedActivity: Activity = {
              ...activity,
              ...commonData,
              schoolId: currentUser.schoolId,
              enrolledStudentIds: activity.enrolledStudentIds,
          };
          await api.updateActivity(updatedActivity);
      } else {
          const newActivity: ActivityCreationData = {
              ...commonData,
              schoolId: currentUser.schoolId,
          };
          await api.createActivity(newActivity);
      }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Si la actividad se está cambiando a cancelada, mostrar el modal de notificación
    if (isEditing && formData.status === Status.Cancelled && activity?.status !== Status.Cancelled) {
        setIsCancellationModalOpen(true);
        return; // Detener el guardado hasta que se confirme desde el otro modal
    }

    setIsSubmitting(true);
    try {
        await performSave();
        onSave();
    } catch (err) {
      setError('Failed to save activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleConfirmCancellation = async (customMessage: string) => {
      setIsSubmitting(true);
      setError(null);
      try {
          await performSave(); // Guarda el estado "Cancelled"
          if(activity) {
              await api.sendCancellationNotification(activity, customMessage);
          }
          setIsCancellationModalOpen(false);
          onSave();
      } catch (err) {
          setError('Failed to cancel activity. Please try again.');
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <>
    <Modal
      isOpen={isOpen && !isCancellationModalOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Actividad' : 'Crear Nueva Actividad'}
      closeOnOverlayClick={false}
      footer={
        <div className="space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 pb-20">
        {error && <div className="text-red-500 text-sm p-3 bg-red-100 rounded-md">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="name">Nombre de la actividad</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
             <div>
                <Label htmlFor="responsiblePerson">Persona Responsable</Label>
                <Input id="responsiblePerson" name="responsiblePerson" value={formData.responsiblePerson} onChange={handleChange} required />
            </div>
        </div>
        <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <DateTimePicker 
                    id="startDate" 
                    label="Fecha de Inicio" 
                    value={formData.startDate} 
                    onChange={(val) => handleDateChange('startDate', val)} 
                    required 
                />
            </div>
            <div>
                <DateTimePicker 
                    id="endDate" 
                    label="Fecha de Fin" 
                    value={formData.endDate} 
                    onChange={(val) => handleDateChange('endDate', val)} 
                    required 
                />
            </div>
             <div>
                <Label htmlFor="maxCapacity">Cupo Máximo</Label>
                <Input id="maxCapacity" name="maxCapacity" type="number" value={formData.maxCapacity} onChange={handleChange} required min="0" />
            </div>
            <div>
                 <Label htmlFor="cost">Costo</Label>
                 <div className="flex items-center">
                    <Select name="currency" value={formData.currency} onChange={handleChange} className="w-24 rounded-r-none">
                        <option value="DOP">DOP</option>
                        <option value="USD">USD</option>
                    </Select>
                    <Input id="cost" name="cost" type="number" value={formData.cost} onChange={handleChange} required min="0" step="0.01" className="rounded-l-none" />
                </div>
            </div>
            <div>
                <Label htmlFor="status">Estado</Label>
                <Select id="status" name="status" value={formData.status} onChange={handleChange}>
                    <option value={Status.Pending}>Pendiente</option>
                    <option value={Status.Confirmed}>Confirmada</option>
                    <option value={Status.Cancelled}>Cancelada</option>
                    <option value={Status.Rescheduled}>Reprogramada</option>
                </Select>
            </div>
            <div>
                <Label htmlFor="visibility">Visibilidad</Label>
                <Select id="visibility" name="visibility" value={formData.visibility} onChange={handleChange}>
                    <option value="Public">Pública (enlace de inscripción)</option>
                    <option value="Private">Privada (solo para inscritos)</option>
                </Select>
            </div>
             <div className="md:col-span-2">
                <Label htmlFor="participatingLevels">Niveles Participantes</Label>
                <Select id="participatingLevels" name="participatingLevels" value={formData.participatingLevels} onChange={handleChange} multiple className="h-24">
                   {availableGradeLevels.length > 0 ? (
                       availableGradeLevels.map(level => <option key={level.id} value={level.name}>{level.name}</option>)
                   ) : (
                       <option value="" disabled>No hay niveles creados en este colegio</option>
                   )}
                </Select>
                 <p className="text-xs text-gray-500 mt-1">Mantén presionado Ctrl (o Cmd en Mac) para seleccionar múltiples opciones.</p>
            </div>
            <div className="md:col-span-2">
                <Label>Métodos de Pago Aceptados</Label>
                <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-4">
                         {Object.values(PaymentMethod).map(method => (
                            <label key={method} className="flex items-center">
                                <input type="checkbox" name="paymentMethods" value={method} checked={formData.acceptedPaymentMethods.includes(method)} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <span className="ml-2 text-sm text-gray-700">{(method as string).replace(/([A-Z])/g, ' $1').trim()}</span>
                            </label>
                         ))}
                    </div>
                     <label className="flex items-center text-xs text-gray-600">
                        <input type="checkbox" name="selectAllPaymentMethods" checked={formData.acceptedPaymentMethods.length === Object.values(PaymentMethod).length} onChange={handleChange} className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="ml-2">Seleccionar todos</span>
                    </label>
                </div>
            </div>
            <div className="md:col-span-2">
                <Label>Imagen de la Actividad</Label>
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
                            <div className="flex text-sm text-gray-600">
                                <span className="relative bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                    <span>Sube un archivo</span>
                                </span>
                                <p className="pl-1">o arrástralo aquí</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                        </>
                    )}
                    </div>
                </div>
                <input
                    ref={fileInputRef}
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>

            <div className="md:col-span-2 pt-4 border-t">
              <h4 className="font-semibold text-gray-800 mb-2">Asignación de Materiales</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto p-2 border rounded-md mb-4 bg-gray-50">
                {assignments.length > 0 ? assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-2 bg-white rounded shadow-sm">
                        <div>
                            <p className="text-sm font-medium text-gray-900">{assignment.description}</p>
                            <p className="text-xs text-gray-500">
                                Asignado a: {parents.find(p => p.id === assignment.assignedParentId)?.name || '...'}
                            </p>
                        </div>
                        <button type="button" onClick={() => handleRemoveAssignment(assignment.id)} className="text-red-500 hover:text-red-700 font-bold p-1">&times;</button>
                    </div>
                )) : (
                    <p className="text-sm text-gray-500 text-center py-2">No hay materiales asignados.</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-end gap-2">
                <div className="flex-grow w-full">
                  <Label htmlFor="new-assignment-desc">Producto/Material</Label>
                  <Input 
                    id="new-assignment-desc" 
                    value={newAssignmentDesc}
                    onChange={(e) => setNewAssignmentDesc(e.target.value)}
                    placeholder="Ej: 2 cartulinas de colores"
                  />
                </div>
                <div className="flex-grow w-full">
                  <Label htmlFor="new-assignment-parent">Asignar a Padre/Madre</Label>
                  <Select
                    id="new-assignment-parent"
                    value={newAssignmentParentId}
                    onChange={(e) => setNewAssignmentParentId(e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    {parents.map(parent => (
                        <option key={parent.id} value={parent.id}>{parent.name}</option>
                    ))}
                  </Select>
                </div>
                <Button type="button" variant="secondary" onClick={handleAddAssignment} className="w-full sm:w-auto">Añadir</Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-6">
                <input type="checkbox" id="requiresAssistanceRegistration" name="requiresAssistanceRegistration" checked={formData.requiresAssistanceRegistration} onChange={handleChange} className="form-checkbox" />
                <Label htmlFor="requiresAssistanceRegistration" className="mb-0">Requiere registro de asistencia</Label>
            </div>
        </div>
      </form>
    </Modal>
    
    {activity && (
        <CancellationNotificationModal 
            isOpen={isCancellationModalOpen}
            onClose={() => setIsCancellationModalOpen(false)}
            onConfirmSend={handleConfirmCancellation}
            activity={activity}
            isSending={isSubmitting}
        />
    )}
    </>
  );
};
