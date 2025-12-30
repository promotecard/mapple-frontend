
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { api } from '../../services/mockApi';
import { useAppContext } from '../../context/AppContext';
import type { Student } from '../../types';
import { PaymentMethod, PaymentStatus } from '../../types';

interface CreateChargeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export const CreateChargeModal: React.FC<CreateChargeModalProps> = ({ isOpen, onClose, onSave }) => {
    const { currentUser } = useAppContext();
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [concept, setConcept] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && currentUser?.schoolId) {
            api.getStudentsBySchool(currentUser.schoolId).then(setStudents);
            // Default due date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setDueDate(tomorrow.toISOString().split('T')[0]);
        }
    }, [isOpen, currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.schoolId || !selectedStudentId) return;

        setIsSubmitting(true);
        try {
            const student = students.find(s => s.id === selectedStudentId);
            
            // Create the transaction directly via API (mocking a charge creation)
            // In a real app, we would have a specific endpoint for 'createCharge'
            // Here we simulate it by creating an Order which generates a Transaction
            await api.createOrder({
                providerId: 'school-internal', // Marking as internal school charge
                schoolId: currentUser.schoolId,
                parentId: student?.parentId,
                studentId: selectedStudentId,
                customerName: student?.name || 'Estudiante',
                items: [{ productId: 'custom', productName: concept, quantity: 1, price: Number(amount) }],
                subtotal: Number(amount),
                taxAmount: 0,
                finalAmount: Number(amount),
                paymentMethod: PaymentMethod.Cash, // Placeholder, really means "Pending Payment"
                status: 'Pending', // Pending Payment
                orderDate: new Date().toISOString()
            });

            // Note: In a real backend, we would pass the 'dueDate' to the backend to handle automatic late fees.
            // For this mock, we simply create the record.
            
            onSave();
            onClose();
        } catch (error) {
            alert('Error al crear el cargo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Crear Cargo Individual / Mora"
            footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Creando...' : 'Crear Cargo'}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="student">Estudiante</Label>
                    <Select 
                        id="student" 
                        value={selectedStudentId} 
                        onChange={e => setSelectedStudentId(e.target.value)}
                        required
                    >
                        <option value="">Seleccionar estudiante...</option>
                        {students.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </Select>
                </div>
                <div>
                    <Label htmlFor="concept">Concepto</Label>
                    <Input 
                        id="concept" 
                        value={concept} 
                        onChange={e => setConcept(e.target.value)} 
                        placeholder="Ej: Mora por recogida tardía, Duplicado de carnet..." 
                        required 
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="amount">Monto (DOP)</Label>
                        <Input 
                            id="amount" 
                            type="number" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)} 
                            placeholder="0.00" 
                            min="0" 
                            required 
                        />
                    </div>
                    <div>
                        <Label htmlFor="dueDate">Fecha Límite</Label>
                        <Input 
                            id="dueDate" 
                            type="date" 
                            value={dueDate} 
                            onChange={e => setDueDate(e.target.value)} 
                            required 
                        />
                        <p className="text-xs text-gray-500 mt-1">Fecha para cálculo de moras.</p>
                    </div>
                </div>
            </form>
        </Modal>
    );
};
