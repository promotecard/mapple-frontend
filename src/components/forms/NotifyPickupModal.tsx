import React, { useState, useEffect } from 'react';
import type { Student } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api } from '../../services/mockApi';
import { useAppContext } from '../../context/AppContext';

export const NotifyPickupModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { currentUser } = useAppContext();
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [view, setView] = useState<'form' | 'success'>('form');

    useEffect(() => {
        if (isOpen && currentUser) {
            setView('form');
            api.getStudentsByParent(currentUser.id).then(data => {
                setStudents(data);
                if (data.length > 0) {
                    setSelectedStudentId(data[0].id);
                }
            });
        }
    }, [isOpen, currentUser]);

    const handleNotify = async () => {
        if (!currentUser || !selectedStudentId) return;
        
        try {
            await api.startParentPickup(currentUser.id, selectedStudentId);
            setView('success');
        } catch (error) {
            console.error("Failed to notify pickup", error);
            alert("Error al notificar. Intente de nuevo.");
        }
    };
    
    const renderForm = () => (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title="Notificar Recogida"
          footer={
            <div className="space-x-2">
              <Button variant="secondary" onClick={onClose}>Cancelar</Button>
              <Button onClick={handleNotify} disabled={!selectedStudentId}>Notificar y Compartir Ruta</Button>
            </div>
          }
        >
            <p className="text-gray-600 mb-4">Seleccione el dependiente que va a retirar. Su ruta se compartirá con el profesor para facilitar la entrega.</p>
            <div className="space-y-2">
                {students.map(student => (
                    <label key={student.id} className={`flex items-center p-3 rounded-lg border-2 cursor-pointer ${selectedStudentId === student.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                        <input type="radio" name="student-pickup" value={student.id} checked={selectedStudentId === student.id} onChange={(e) => setSelectedStudentId(e.target.value)} className="h-4 w-4 text-blue-600 focus:ring-blue-500"/>
                        <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full mx-3"/>
                        <span className="font-medium">{student.name}</span>
                    </label>
                ))}
            </div>
        </Modal>
    );
    
    const renderSuccess = () => (
         <Modal isOpen={isOpen} onClose={onClose} title="Notificación Enviada">
             <div className="text-center p-6">
                 <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-semibold">¡El colegio ha sido notificado!</h3>
                <p className="text-gray-600 mt-2">Su ruta ahora es visible para el profesor. Por favor, conduzca con cuidado.</p>
                <Button onClick={onClose} className="mt-6">Entendido</Button>
             </div>
         </Modal>
    );
    
    return view === 'form' ? renderForm() : renderSuccess();
};